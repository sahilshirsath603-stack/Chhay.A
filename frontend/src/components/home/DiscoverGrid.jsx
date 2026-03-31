import UserCard from "./UserCard";

export default function DiscoverGrid({ users, currentUser, sentRequests, onlineUsers, activeRooms }) {
    if (!users || !users.length) {
        return <p style={{ textAlign: "center", color: "#888", padding: "40px" }}>No users found.</p>;
    }

    return (
        <div className="discover-grid">
            {users.map(user => {
                const isOnline = onlineUsers ? onlineUsers.has(user._id) : false;
                const isInRoom = activeRooms ? activeRooms.some(r => r.participants.includes(user._id)) : false;

                return (
                    <UserCard
                        key={user._id}
                        user={user}
                        currentUser={currentUser}
                        sentRequests={sentRequests}
                        isOnline={isOnline}
                        isInRoom={isInRoom}
                    />
                );
            })}
        </div>
    );
}
