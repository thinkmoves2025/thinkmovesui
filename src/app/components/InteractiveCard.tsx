'use client';

export default function InteractiveCard({ onClick }: { onClick: () => void }) {
    return <button onClick={onClick}>Logout</button>;
}
