import crypto from "crypto";

export class EmbedService {
  generateToken() {
    return crypto.randomUUID();
  }

  script(
    token: string
  ) {
    return `<script
src="https://cdn.privystack.com/banner.js"
data-banner="${token}">
</script>`;
  }
}

export const embedService =
  new EmbedService();