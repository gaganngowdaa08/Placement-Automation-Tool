export function homeForRole(role) {
  switch ((role || "student").toLowerCase()) {
    case "company": return "/company";
    case "college": return "/college";
    default: return "/dashboard";
  }
}
