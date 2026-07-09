const VISITOR_KEY =
  "privystack_visitor_id";

export function loadVisitorId() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(
    VISITOR_KEY
  );
}

export function saveVisitorId(
  id: string
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    VISITOR_KEY,
    id
  );
}