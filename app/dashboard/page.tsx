import "./dashboard.css";

export default function Dashboard() {
    return (
        <div className = "dashboardContainer">
            <div className = "header">
                <h1>CareLedger</h1>
            </div>
        <div className = "button container">
            <button className = "dashboardButton">Add Clients</button>
            <button className = "dashboardButton">Invite Collaborators</button>
        </div>

        </div>
    );
}