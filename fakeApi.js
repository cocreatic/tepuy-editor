(function(){
    var templates = [{
        id:'1',
        preview:'https://picsum.photos/400/100?t=1',
        description:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
        createdAt:'12/02/2020',
        name:'Lorem 1',
        category:'Category 1',
        license:'GPL',
        createdBy:"Fulanito",
        url: "http://localhost/rutatic_salud/plantilla/"
    }, {
        id:'2',
        preview:'https://picsum.photos/400/100?t=2',
        description:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
        createdAt:'12/02/2020',
        name:'Lorem 2',
        category:'Category 2',
        license:'GPL',
        createdBy:"Jesús Otero",
        url: "http://localhost/rutatic_salud/plantilla/"
    }, {
        id:'4',
        preview:'https://picsum.photos/400/100?t=3',
        description:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
        createdAt:'13/08/2019',
        name:'Lorem 4',
        category:'Category 3',
        license:'GPL',
        createdBy:"Fulanito",
        url: "http://localhost/rutatic_salud/plantilla/"
    }, {
        id:'5',
        preview:'https://picsum.photos/400/100?t=4',
        description:"t is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
        createdAt:'15/12/2007',
        name:'Lorem 5',
        category:'Category 3',
        license:'GPL',
        createdBy:"Jesús Otero",
        url: "http://localhost/rutatic_salud/plantilla/"
    }];

    var userData ={
        id:'1',
        userName:'guest',
        password:'123456',
        name:'Invitado',
        profile_image:'https://picsum.photos/50/50?t=4'
    };

    var resoucesData = [    
        {
            name: "Content",
            type: "D", //F|D
            path: "/Content", //Relative to the object root
            createdAt: "2019-12-31", //Date
            isDro: false, //true|false Is a Digital Resource object
            size: 0, //Size only if it is file
            extension: '', //
            thumbnail: '' //
        },
        {
            name: "File.png",
            type: "F", //F|D
            path: "/Images", //Relative to the object root
            createdAt: "2019-12-30", //Date
            isDro: false, //true|false Is a Digital Resource object
            size: 100000, //Size only if it is file
            extension: 'png', //
            thumbnail: 'https://picsum.photos/24/24?t=4' //
        },
        {
            name: "export.pdf",
            type: "F", //F|D
            path: "/Content", //Relative to the object root
            createdAt: "2019-11-21", //Date
            isDro: true, //true|false Is a Digital Resource object
            size: 45300, //Size only if it is file
            extension: 'pdf', //
            thumbnail: '' //
        },
        {
            name: "plantilla.doc",
            type: "F", //F|D
            path: "/Content", //Relative to the object root
            createdAt: "2019-02-12", //Date
            isDro: true, //true|false Is a Digital Resource object
            size: 4000, //Size only if it is file
            extension: 'pdf', //
            thumbnail: '' //
        },
        {
            name: "export.xls",
            type: "F", //F|D
            path: "/Content", //Relative to the object root
            createdAt: "2019-11-21", //Date
            isDro: true, //true|false Is a Digital Resource object
            size: 45300, //Size only if it is file
            extension: 'xls', //
            thumbnail: '' //
        }
    ];

    var fakeApi = {
        getTemplates: function (filter) {
          return templates.filter(item => {
              var matchCat = null;
              if (filter.categories && filter.categories.length) {
                  matchCat = filter.categories.indexOf(item.category) >= 0;
              }

              var matchKeyword = null;
              if (filter.keyword && filter.keyword != '') {
                  var re = new RegExp(filter.keyword, 'i');
                  matchKeyword = re.test(item.description) || re.test(item.name)  || re.test(item.category);
              }

              return (matchKeyword == null || matchKeyword) && (matchCat == null || matchCat);
          })
        },
        getTemplateCategories: function() {
          return ['Category 1', 'Category 2', 'Category 3'];
        },

        getUserData: function(){
            return userData;
        },
        /*
        Object resources methods
        */
        /*
        List all resouces (files and folder) at an specified path of the object e.g (/, /content)
        returns: Array with the list of objects in the given path. 
        */
        getResources: function(path){
            return resoucesData.filter(item=>{
            var matchPath = null;
            if(path && path != ''){
                var res = new RegExp(path,'i');
                matchPath = res.test(item.path);
            }
            return(matchPath == null|| matchPath);
           });     
        },
        /*
        Will rename a file in the object directory structure
        returns: { succeed: true | false, message: string };
        */
        renameResource: function(resource, newpath){
            return { succeed: true | false, message: '' };
        },
        /*
        Will delete a file in the object directory structure
        returns: { succeed: true | false, message: string };
        */
        deleteResource: function(resource){
            return { succeed: true | false, message: '' };
        },
        /*
        Will create a new resource in the directory structure at the given path
        resouce: { type: F|D, name: string, file: Blob | null }
        returns: { succeed: true | false, message: string };
        */
        createResource: function(resource, path){

        },
    };
    window.fakeApi = fakeApi;
})()