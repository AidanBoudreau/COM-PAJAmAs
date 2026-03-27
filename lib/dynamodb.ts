import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

export interface ClientRecord {
  clientId: string;
  firstName: string;
  lastName: string;
  dob: string;
  amount: number;
  purpose: string;
  lastHelpedDate: string;
}

export interface EligibilityConfigRecord {
  configKey: "eligibility";
  eligibilityWindowDays: number;
}

export type UserRole = "admin" | "staff";

export interface UserRecord {
  userId: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export interface SafeUserRecord {
  userId: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

const DEFAULT_ELIGIBILITY_WINDOW_DAYS = 365;
const ELIGIBILITY_CONFIG_KEY = "eligibility";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }

  return value;
}

let cachedDocClient: DynamoDBDocumentClient | null = null;

function getDocumentClient() {
  if (!cachedDocClient) {
    const region = getRequiredEnv("AWS_REGION");
    const dynamoClient = new DynamoDBClient({ region });
    cachedDocClient = DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }

  return cachedDocClient;
}

function getClientsTableName() {
  return getRequiredEnv("CLIENTS_TABLE_NAME");
}

function getConfigTableName() {
  return getRequiredEnv("CONFIG_TABLE_NAME");
}

function getUsersTableName() {
  return getRequiredEnv("USERS_TABLE_NAME");
}

function isConditionalCheckFailed(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name: string }).name === "ConditionalCheckFailedException"
  );
}

export async function createClient(client: ClientRecord) {
  await getDocumentClient().send(
    new PutCommand({
      TableName: getClientsTableName(),
      Item: client,
      ConditionExpression: "attribute_not_exists(clientId)",
    }),
  );
}

export async function getClientById(clientId: string) {
  const response = await getDocumentClient().send(
    new GetCommand({
      TableName: getClientsTableName(),
      Key: { clientId },
    }),
  );

  return (response.Item as ClientRecord | undefined) ?? null;
}

export async function searchClientsByLastNameAndDob(lastName: string, dob: string) {
  const clients: ClientRecord[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;
  const lastNameLower = lastName.toLowerCase();

  do {
    const response = await getDocumentClient().send(
      new ScanCommand({
        TableName: getClientsTableName(),
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );

    const items = (response.Items as ClientRecord[] | undefined) ?? [];
    for (const item of items) {
      if (item.lastName.toLowerCase() === lastNameLower && item.dob === dob) {
        clients.push(item);
      }
    }

    exclusiveStartKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (exclusiveStartKey);

  return clients;
}

type UpdatableClientFields = Omit<ClientRecord, "clientId">;

export async function updateClientById(
  clientId: string,
  updates: Partial<UpdatableClientFields>,
) {
  const entries = Object.entries(updates).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    throw new Error("At least one field is required for update.");
  }

  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};
  const setExpressions: string[] = [];

  entries.forEach(([key, value], index) => {
    const nameKey = `#f${index}`;
    const valueKey = `:v${index}`;

    expressionAttributeNames[nameKey] = key;
    expressionAttributeValues[valueKey] = value;
    setExpressions.push(`${nameKey} = ${valueKey}`);
  });

  try {
    const response = await getDocumentClient().send(
      new UpdateCommand({
        TableName: getClientsTableName(),
        Key: { clientId },
        UpdateExpression: `SET ${setExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: "attribute_exists(clientId)",
        ReturnValues: "ALL_NEW",
      }),
    );

    return (response.Attributes as ClientRecord | undefined) ?? null;
  } catch (error) {
    if (isConditionalCheckFailed(error)) {
      return null;
    }

    throw error;
  }
}

async function seedDefaultEligibilityConfigIfMissing() {
  try {
    await getDocumentClient().send(
      new PutCommand({
        TableName: getConfigTableName(),
        Item: {
          configKey: ELIGIBILITY_CONFIG_KEY,
          eligibilityWindowDays: DEFAULT_ELIGIBILITY_WINDOW_DAYS,
        },
        ConditionExpression: "attribute_not_exists(configKey)",
      }),
    );
  } catch (error) {
    if (!isConditionalCheckFailed(error)) {
      throw error;
    }
  }
}

export async function getEligibilityConfig() {
  const response = await getDocumentClient().send(
    new GetCommand({
      TableName: getConfigTableName(),
      Key: { configKey: ELIGIBILITY_CONFIG_KEY },
    }),
  );

  const existing = response.Item as EligibilityConfigRecord | undefined;
  if (existing) {
    return existing;
  }

  await seedDefaultEligibilityConfigIfMissing();

  return {
    configKey: "eligibility" as const,
    eligibilityWindowDays: DEFAULT_ELIGIBILITY_WINDOW_DAYS,
  };
}

export async function updateEligibilityConfig(eligibilityWindowDays: number) {
  await getDocumentClient().send(
    new PutCommand({
      TableName: getConfigTableName(),
      Item: {
        configKey: ELIGIBILITY_CONFIG_KEY,
        eligibilityWindowDays,
      },
    }),
  );

  return {
    configKey: "eligibility" as const,
    eligibilityWindowDays,
  };
}

export function toSafeUserRecord(user: UserRecord): SafeUserRecord {
  return {
    userId: user.userId,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function getUserByEmail(email: string) {
  const response = await getDocumentClient().send(
    new ScanCommand({
      TableName: getUsersTableName(),
      FilterExpression: "#email = :email",
      ExpressionAttributeNames: {
        "#email": "email",
      },
      ExpressionAttributeValues: {
        ":email": email,
      },
      Limit: 1,
    }),
  );

  return (response.Items?.[0] as UserRecord | undefined) ?? null;
}

export async function listUsers() {
  const users: UserRecord[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const response = await getDocumentClient().send(
      new ScanCommand({
        TableName: getUsersTableName(),
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );

    users.push(...((response.Items as UserRecord[] | undefined) ?? []));
    exclusiveStartKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (exclusiveStartKey);

  return users;
}

export async function isUsersTableEmpty() {
  const response = await getDocumentClient().send(
    new ScanCommand({
      TableName: getUsersTableName(),
      Limit: 1,
      Select: "COUNT",
    }),
  );

  return (response.Count ?? 0) === 0;
}

export async function createUser(user: UserRecord) {
  await getDocumentClient().send(
    new PutCommand({
      TableName: getUsersTableName(),
      Item: user,
      ConditionExpression: "attribute_not_exists(userId)",
    }),
  );
}

export async function deleteUserById(userId: string) {
  try {
    await getDocumentClient().send(
      new DeleteCommand({
        TableName: getUsersTableName(),
        Key: { userId },
        ConditionExpression: "attribute_exists(userId)",
      }),
    );

    return true;
  } catch (error) {
    if (isConditionalCheckFailed(error)) {
      return false;
    }

    throw error;
  }
}

export async function getAllClients(): Promise<ClientRecord[]> {
  const clients: ClientRecord[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const response = await getDocumentClient().send(
      new ScanCommand({
        TableName: getClientsTableName(),
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );

    clients.push(...((response.Items as ClientRecord[] | undefined) ?? []));
    exclusiveStartKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (exclusiveStartKey);

  return clients;
}

export async function scanClientsByDateRange(
  startDate: string,
  endDate: string,
): Promise<ClientRecord[]> {
  const clients: ClientRecord[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const response = await getDocumentClient().send(
      new ScanCommand({
        TableName: getClientsTableName(),
        FilterExpression: "#lhd BETWEEN :start AND :endDate",
        ExpressionAttributeNames: {
          "#lhd": "lastHelpedDate",
        },
        ExpressionAttributeValues: {
          ":start": startDate,
          ":endDate": endDate,
        },
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );

    clients.push(...((response.Items as ClientRecord[] | undefined) ?? []));
    exclusiveStartKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (exclusiveStartKey);

  return clients;
}

export { isConditionalCheckFailed };
