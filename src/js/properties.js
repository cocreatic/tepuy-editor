export default {
    plugins: [
        { id: "gui.default", active: true },
        { id: "gui.templateChooser", active: true },
        { id: "gui.editor", active: true },
        { id: "storage.local", active: true },
        { id: "auth.local", active: true }
    ],
    themes: [""],
    gui: "gui.default",
    storage: "local",
    authentication: "local"
};