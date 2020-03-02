(function(){
    var templates = [{
        id:'1',
        imagen:'https://picsum.photos/400/100',
        description:"Lorem ipsum1",
        createdBy:'12/02/2020',
        category:'Cat1',
        license:'GPL'
    }, {
        id:'2',
        imagen:'https://picsum.photos/400/100',
        description:"Lorem ipsum2",
        createdBy:'12/02/2020',
        category:'Cat2',
        license:'GPL'
    }, {
        id:'4',
        imagen:'https://picsum.photos/400/100',
        description:"Lorem ipsum3",
        createdBy:'13/08/2019',
        category:'Cat3',
        license:'GPL'
    }, {
        id:'5',
        imagen:'https://picsum.photos/400/100',
        description:"Lorem ipsum4",
        createdBy:'15/12/2007',
        category:'Cat3',
        license:'GPL'
    }];

    var fakeApi = {
        getTemplates: function (filter) {
          //ToDo: implement method to return data
          console.log(filter);
          return templates.filter(item => {
              var matchCat = null;
              if (filter.categories && filter.categories.length) {
                  matchCat = filter.categories.indexOf(item.category) >= 0;
              }

              var matchKeyword = null;
              if (filter.keyword && filter.keyword != '') {
                  var re = new RegExp(filter.keyword, 'i');
                  matchKeyword = re.test(item.description);
              }

              return (matchKeyword == null || matchKeyword) && (matchCat == null || matchCat);

          })
        },
        getTemplateCategories: function() {
          //ToDo: implement method to return array list of categories
          return ['Cat1', 'Cat2', 'Cat3'];
        }
    };
    window.fakeApi = fakeApi;
})()