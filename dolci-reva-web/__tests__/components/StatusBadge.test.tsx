/**
 * Tests unitaires pour le composant StatusBadge
 */

import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/shared/StatusBadge";

describe("StatusBadge", () => {
  const statusMap = {
    ACTIVE: { label: "Actif", color: "text-green-700", bg: "bg-green-100" },
    INACTIVE: { label: "Inactif", color: "text-gray-700", bg: "bg-gray-100" },
    PENDING: { label: "En attente", color: "text-yellow-700", bg: "bg-yellow-100" },
  };

  it("should render status badge with correct label", () => {
    render(<StatusBadge status="ACTIVE" statusMap={statusMap} />);
    expect(screen.getByText("Actif")).toBeInTheDocument();
  });

  it("should return null when status is null", () => {
    const { container } = render(<StatusBadge status={null} statusMap={statusMap} />);
    expect(container.firstChild).toBeNull();
  });

  it("should return null when status is undefined", () => {
    const { container } = render(<StatusBadge status={undefined} statusMap={statusMap} />);
    expect(container.firstChild).toBeNull();
  });

  it("should use default styling for unknown status", () => {
    render(<StatusBadge status="UNKNOWN" statusMap={statusMap} />);
    expect(screen.getByText("UNKNOWN")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <StatusBadge status="ACTIVE" statusMap={statusMap} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});






