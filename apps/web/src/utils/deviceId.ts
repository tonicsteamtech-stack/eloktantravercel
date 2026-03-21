export const getDeviceId = () => {
  if (typeof window === "undefined") return "server-side";
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
};
