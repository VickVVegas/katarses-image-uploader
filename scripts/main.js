import { UploadApp } from "./apps/UploadApp.js";

Hooks.once("init", () => {
  game.settings.register("katarses-image-uploader","defaultTarget",{
    name: "Default Target Folder",
    hint: "The default folder where images will be uploaded (e.g., 'uploads/katarses').",
    scope: "world",
    config: true,
    type: String,
    default: "uploads/katarses"
  });

  game.settings.register("katarses-image-uploader","openUploader",{
    name: game.i18n.localize("KIU.OpenUploader"),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: () => {
      if (!game.user.isGM) return ui.notifications.warn(game.i18n.localize("KIU.OnlyGM"));
      const target = game.settings.get("katarses-image-uploader","defaultTarget");
      new UploadApp({target}).render(true);
      game.settings.set("katarses-image-uploader","openUploader", false);
    }
  });
});

Hooks.on("getSceneControlButtons", (controls) => {
  const tool = {
    name: "kiu-upload",
    title: game.i18n.localize("KIU.Title"),
    icon: "fas fa-camera",
    visible: game.user.isGM,
    onClick: () => {
      const target = game.settings.get("katarses-image-uploader","defaultTarget");
      new UploadApp({target}).render(true);
    },
    button: true
  };
  // Put it under the 'token' controls by default
  const token = controls.find(c => c.name === "token");
  if (token) token.tools.push(tool);
});
