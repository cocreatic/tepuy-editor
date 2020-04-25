const templateMap = {
    sidebar: 'script#gui-editor-sidebar',
    content: 'script#gui-editor-content',
    editPage: 'script#gui-editor-edit-page',
    editSection: 'script#gui-editor-edit-section',
    pageView: 'script#gui-editor-page',
    pageViewStyles: 'script#gui-editor-page-styles'
}

export const TemplateManager = {
    get: (templateName) => {
        if (!$.templates[templateName]) {
            $.templates({[templateName]: templateMap[templateName]});
        }
        return $.templates[templateName];
    }
}