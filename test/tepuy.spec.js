import { expect } from './setup';
import { App } from '../src/js/app';
import { Component, Section } from '../src/js/component';
import { Tepuy } from '../src/js/tepuy';
import { default as tepuys } from './tepuy.spec.json';


describe('Tepuy parser', function () {
    let tepuy;

    before(function() {
        console.log('running tepuy parser tests');
        return new Promise((resolve, reject) => {
            const container = document.createElement('div');
            container.setAttribute('id', 'tepuy-editor');
            document.body.appendChild(container);

            App.init({
                theme: 'light', //
                container: $(container)
            }).then(r => {
                tepuy = new Tepuy(tepuys[0]);
                tepuy.parse().then(res => resolve(), err => {
                    console.log(err);
                    resolve();
                });
                //resolve();
            }, err => {
                console.log('Initialization did not complete. Ignoring it.');
                //console.log(err);
                //console.log('Lets continue with the test...');
                try{
                tepuy = new Tepuy(tepuys[0]);
                tepuy.parse().then(res => resolve(), err => {
                    console.log(err);
                    resolve();
                });
                }catch(err1) {
                    console.log(err1);
                }
            });
        });
    })

    beforeEach(function() {
        //return tepuy.parse();
    })

    it('should create home root as Section', function() {
        expect(tepuy.home.root).to.be.an.instanceof(Section);
    })

    it('should have home root with four components', function() {
        expect(tepuy.home.root.children).to.have.length(5);
    })

    it('should have all home root children of type HtmlBlock', function() {
        expect(tepuy.home.root.children).all.to.satisfy(child => child.cmptType == 'html-block');
    })

    it('should have content with seven pages', function() {
        expect(tepuy.content.pages).to.have.length(7);
    })

    //Page 1

    it('should have page 1 with 4 sections', function() {
        expect(tepuy.content.pages[0].sections).to.have.length(4);
    })

    //Page 2
    describe('Content Page 2', function() {
        let page;
        before(function() {
            page = tepuy.content.pages[1];
            if (!page) this.skip();
        })

        it('should have 20 sections', function() {
            expect(page.sections).to.have.length(20);
        })

        const contentBoxSections = [
            { title: 'Important', label: 'Importante', type: 'important' },
            { title: 'Example', label: 'Ejemplo', type: 'example' },
            { title: 'Note', label: 'Nota', type: 'note' },
            { title: 'Link', label: 'Enlace', type: 'link' },
            { title: 'Connection', label: '', type: 'connection' },
            { title: 'Activity', label: 'Actividad de aprendizaje', type: 'activity' }
        ];

        contentBoxSections.forEach((test, i) => {
            describe('Section ' + (3+i), function() {
                let section;
                before(function() {
                    section = page.sections[2+i];
                    if (!section) this.skip();
                })

                describe(test.title + ' Content Box', function() {
                    let contentbox;

                    before(function() {
                        contentbox = section.children.find(child => child.cmptType == 'content-box');
                    })

                    it('should exists', function() {
                        expect(contentbox).to.not.be.undefined;
                    })

                    it('should have type equal "'+ test.type + '"', function() {
                        expect(contentbox.getPropertyValue('type')).to.be.equal(test.type);
                    })

                    it('should have label equal "'+test.label+'"', function() {
                        expect(contentbox.getPropertyValue('label')).to.be.equal(test.label);
                    })
                })
            })
        })

        describe('Section 9', function() {
            let section;
            before(function() {
                section = page.sections[8];
                if (!section) this.skip();
            })

            describe('Example content box with instructions', function() {
                let contentbox;
                before(function() {
                    contentbox = section.children.find(child => child.cmptType == 'content-box');
                    if (!contentbox) this.skip();
                })

                const instructioBoxes = [
                    { index: 2, title: 'Help', type: '' },
                    { index: 6, title: 'Info', type: 'info' },
                    { index: 9, title: 'Danger', type: 'danger' },
                    { index: 10, title: 'Alert', type: 'alert' },
                    { index: 11, title: 'None', type: 'none' }
                ];

                instructioBoxes.forEach((test, i) => {
                    describe(test.title + ' Instruction Box', function() {
                        let instructionbox;

                        before(function() {
                            instructionbox = contentbox.children[test.index];
                        })

                        it('should exists', function() {
                            expect(instructionbox).to.not.be.undefined;
                        })

                        it('should be an InstructionBox', function() {
                            expect(instructionbox).to.have.property('cmptType', 'instruction-box');
                        })

                        it('should have type equal "'+ test.type + '"', function() {
                            expect(instructionbox.getPropertyValue('type')).to.be.equal(test.type);
                        })
                    })
                });
            })
        })
    })
})