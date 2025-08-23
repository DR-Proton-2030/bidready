import React from "react";

export default function NotFound() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#f8f9fa",
                color: "#333",
            }}
        >
            <h1 style={{ fontSize: "4rem", marginBottom: "1rem" }}>404</h1>
            <h2 style={{ marginBottom: "0.5rem" }}>Page Not Found</h2>
            <p style={{ marginBottom: "2rem" }}>
                Sorry, the page you are looking for does not exist.
            </p>
            <a
                href="/"
                style={{
                    padding: "0.75rem 1.5rem",
                    background: "#0070f3",
                    color: "#fff",
                    borderRadius: "4px",
                    textDecoration: "none",
                }}
            >
                Go Home
            </a>
        </div>
    );
}