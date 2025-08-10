const MODULE_ID = "katarses-image-uploader";
const SOURCE = "data"; // change to 's3' or others if needed

export class UploadApp extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "kiu-upload",
      title: game.i18n.localize("KIU.Title"),
      template: "modules/katarses-image-uploader/templates/upload-app.hbs",
      width: 560,
      height: "auto",
      resizable: true
    });
  }

  constructor(opts={}){
    super(opts);
    this.target = opts.target ?? game.settings.get(MODULE_ID,"defaultTarget");
    this.dateSub = true;
    this.files = [];
  }

  getData(){
    return {
      target: this.target,
      dateSub: this.dateSub,
      files: this.files.map(f => ({ name: f.name, size: `${Math.ceil(f.size/1024)} KB`}))
    };
  }

  activateListeners(html){
    super.activateListeners(html);
    if (!game.user.isGM) { 
      ui.notifications.warn(game.i18n.localize("KIU.OnlyGM"));
      this.close(); return;
    }

    const drop = html.find(".dropzone");
    const input = html.find("input[type=file]");
    const browse = html.find(".kiu-browse");
    const clearBtn = html.find(".kiu-clear");
    const uploadBtn = html.find(".kiu-upload");
    const targetInput = html.find("input[name=target]");
    const dateToggle = html.find(".kiu-datesub");
    const progress = html.find("#kiu-progress > div");

    // Target change
    targetInput.on("change", ev => this.target = ev.currentTarget.value);
    dateToggle.on("change", ev => this.dateSub = ev.currentTarget.checked);

    // Browse for folder
    browse.on("click", async () => {
      const fp = new FilePicker({
        type: "folder",
        current: this.target,
        callback: (path) => {
          this.target = path; targetInput.val(path);
        }
      });
      fp.browse(this.target).catch(()=>fp.render(true));
    });

    // Click to choose files
    drop.on("click", () => input.trigger("click"));

    // Drag & drop
    drop.on("dragover", ev => { ev.preventDefault(); drop.addClass("drag"); });
    drop.on("dragleave", ev => { ev.preventDefault(); drop.removeClass("drag"); });
    drop.on("drop", ev => {
      ev.preventDefault(); drop.removeClass("drag");
      const files = [...ev.originalEvent.dataTransfer.files].filter(f => f.type.startsWith("image/"));
      this._pushFiles(files);
    });

    // From file input
    input.on("change", ev => {
      const files = [...ev.currentTarget.files].filter(f => f.type.startsWith("image/"));
      this._pushFiles(files);
      input.val("");
    });

    clearBtn.on("click", () => { this.files = []; this.render(); });

    uploadBtn.on("click", async () => {
      if (!this.files.length) return;
      let target = this.target;
      if (this.dateSub){
        const d = new Date();
        const ymd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
        const sub = `${target.replace(/\/$/,'')}/${ymd}`;
        try { await FilePicker.createDirectory(SOURCE, sub); } catch(e){ /* ignore if exists */ }
        target = sub;
      }
      let done=0;
      progress.css("width","0%");
      for (const f of this.files){
        try {
          await FilePicker.upload(SOURCE, target, f, { bucket: null });
          done++;
        } catch (e){
          console.error(e);
          ui.notifications.error(`${game.i18n.localize("KIU.Failed")}: ${f.name}`);
        }
        const pct = Math.floor((done/this.files.length)*100);
        progress.css("width", pct + "%");
      }
      ui.notifications.info(game.i18n.localize("KIU.Done"));
      this.files = [];
      this.render();
    });
  }

  _pushFiles(files){
    this.files = this.files.concat(files);
    this.render();
  }
}
