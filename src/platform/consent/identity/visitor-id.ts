const STORAGE_KEY =
  "privystack-visitor-id";

function generateVisitorId() {
  return (
    "ps_v_" +
    crypto.randomUUID()
  );
}

export function getVisitorId() {
  if (typeof window === "undefined") {
    return "";
  }

  let id =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!id) {
    id = generateVisitorId();

    localStorage.setItem(
      STORAGE_KEY,
      id
    );
  }

  return id;
}