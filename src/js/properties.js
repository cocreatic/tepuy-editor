export default {
    plugins: [
        { id: "gui.default", active: true },
        { id: "gui.templateChooser", active: true },
        { id: "gui.editor", active: true },
        { id: "storage.local", active: true },
        { id: "auth.local", active: true },
        { id: "cmpt.tepuyBasic", active: true },
        { id: "storage.moodle", active: true },
        { id: "auth.moodle", active: true }
    ],
    themes: [""],
    gui: "gui.default",
    storage: "local",
    auth: "local",
    authentication: "local"
};
