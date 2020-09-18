const red = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
'<spec version="0.0.2">' +
  '<id>lom-co_recurso_digital</id>' +
  '<name>Recurso digital</name>' +
  '<description>Recurso digital</description>' +
  '<types>' +
    '<type name="duration">' +
      '<years type="int"/>' +
      '<months type="int"/>' +
      '<days type="int"/>' +
      '<hours type="int"/>' +
      '<minutes type="int"/>' +
      '<seconds type="int"/>' +
    '</type>' +
    '<type name="vcard">' +
      '<name type="string" labelId="vcard_name" required="true"/>' +
      '<lastname type="string" labelId="vcard_lastname"/>' +
      '<company type="string" labelId="vcard_company"/>' +
      '<email type="email" labelId="vcard_email" required="true"/>' +
    '</type>' +
  '</types>' +
  '<optionsets>' +
    '<optionset name="catalogs" values="ISBN|ISMN|ISSN|URI"/>' +
    '<optionset name="structures" values="atomic|collection|networked|hierarchical|linear"/>' +
    '<optionset name="aggregation-levels" values="1|2|3|4"/>' +
    '<optionset name="roles" values="author|content provider|editor|educational validator|adviser|graphical designer|initiator|instructutional designer|publisher|script writer|subject matter expert|technical implementer|technical validator|terminator|unknown|validator"/>' +
    '<optionset name="languages" values="none|ab|aa|af|ay|ak|sq|de|am|ar|an|hy|as|av|ae|az|bm|ba|bn|bh|be|my|bi|bs|br|bg|ks|km|kn|ca|ch|ce|cs|ny|zh|za|cv|si|ko|kw|co|cr|hr|da|dz|cu|sk|sl|es|eo|et|eu|ee|fo|fi|fj|fr|fy|ff|gd|cy|gl|ka|el|kl|gn|gu|ht|ha|he|hz|hi|ho|hu|io|ig|id|en|ia|iu|ik|ga|is|it|ja|jv|kr|kk|ki|ky|rn|kv|kg|kj|ku|lo|la|lv|li|ln|lt|lu|lg|lb|mk|ml|ms|dv|mg|mt|gv|mi|mr|mh|mo|mn|na|nv|nd|nr|ng|nl|ne|no|nb|nn|ie|oc|oj|or|om|os|pi|pa|ps|fa|pl|pt|qu|rm|rw|ro|ru|se|sm|sg|sa|sc|sr|st|tn|sn|sd|so|sw|ss|sv|su|tl|ty|th|ta|tt|tg|te|bo|ti|to|ts|tr|tk|tw|uk|ug|ur|uz|wa|ve|vi|vo|wl|wo|xh|ii|yi|yo|zu"/>' +
    '<optionset name="requirements_types" values="browser|operating system"/>' +
    '<optionset name="interactivity_types" values="active|expositive|mixed"/>' +
    '<optionset name="learning_resource_types" values="self assessment|problem statement|lecture|questionnaire|diagram|exercise|exam|experiment|figure|graph|index|slide|simulation|table|narrative text"/>' +
    '<optionset name="interactivity_levels" values="very low|low|medium|high|very high"/>' +
    '<optionset name="semantic_densities" values="very low|low|medium|high|very high"/>' +
    '<optionset name="user_roles" values="manager|learner|author|teacher"/>' +
    '<optionset name="learning_contexts" values="higher education|training|school|other"/>' +
    '<optionset name="difficulty_levels" values="very easy|easy|medium|difficult|very difficult"/>' +
    '<optionset name="taxon_path_sources" values="NBC"/>' +
    '<optionset name="taxon_path_NBC1" values="1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|60|61|62|63|64|65|66|67|68|69|70|71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88|89|90|91|92|93|94|95|96|97|98|99|100|101|102|103|104|105|106|107|108|109|110|111|112|113|114|115|116|117|118|119|120|121|122|123|124|125|126|127|128|129|130|131|132|133|134|135|136|137|138|139|140|141|142|143|144|145|146|147|148|149|150|151|152|153|154|155|156|157|158|159|160|161|162|163|164|165|166|167|168|169|170|171|172|173|174|175|176|177|178|179|180|181|182|183|184|185|186|187|188|189|190|191|192|193|194|195|196|197|198|199|200|201|202|203|204|205|206|207|208|209|210|211|212|213|214|215|216|217|218|219|220|221|222|223|224|225|226"/>' +
    '<optionset name="taxon_path_NBC" values="&gt;1&gt;::&gt;1&gt;12&gt;|&gt;1&gt;13&gt;||&gt;2&gt;::&gt;2&gt;24&gt;|&gt;2&gt;25&gt;|&gt;2&gt;26&gt;|&gt;2&gt;27&gt;|&gt;2&gt;28&gt;|&gt;2&gt;270&gt;||&gt;3&gt;::&gt;3&gt;313&gt;||&gt;4&gt;::&gt;4&gt;440&gt;|&gt;4&gt;441&gt;|&gt;4&gt;442&gt;|&gt;4&gt;444&gt;|&gt;4&gt;445&gt;|&gt;4&gt;446&gt;|&gt;4&gt;447&gt;|&gt;4&gt;448&gt;|&gt;4&gt;450&gt;||&gt;5&gt;::&gt;5&gt;553&gt;|&gt;5&gt;555&gt;|&gt;5&gt;556&gt;|&gt;5&gt;557&gt;|&gt;5&gt;558&gt;|&gt;5&gt;559&gt;|&gt;5&gt;561&gt;|&gt;5&gt;561&gt;|&gt;5&gt;562&gt;|&gt;5&gt;564&gt;|&gt;5&gt;566&gt;|&gt;5&gt;568&gt;|&gt;5&gt;569&gt;||&gt;6&gt;::&gt;6&gt;69&gt;|&gt;6&gt;611&gt;|&gt;6&gt;612&gt;||&gt;8&gt;::&gt;8&gt;818&gt;|&gt;8&gt;819&gt;|&gt;8&gt;820&gt;|&gt;8&gt;821&gt;|&gt;8&gt;822&gt;|&gt;8&gt;823&gt;|&gt;8&gt;824&gt;|&gt;8&gt;825&gt;|&gt;8&gt;826&gt;|&gt;8&gt;827&gt;|&gt;8&gt;828&gt;|&gt;8&gt;829&gt;|&gt;8&gt;830&gt;|&gt;8&gt;831&gt;|&gt;8&gt;832&gt;|&gt;8&gt;833&gt;||&gt;9&gt;::&gt;9&gt;934&gt;|&gt;9&gt;935&gt;|&gt;9&gt;936&gt;|&gt;9&gt;937&gt;|&gt;9&gt;939&gt;"/>' +
    '<optionset name="costtypes" values="yes|no"/>' +
    '<optionset name="copyrights" values="cc0|cc by 1.0|cc by-sa 1.0|cc by-nd 1.0|cc by-nc 1.0|cc by-nc-sa 1.0|cc by 2.0|cc by-sa 2.0|cc by-nd 2.0|cc by-nc 2.0|cc by-nc-sa 2.0|cc by-nc-nd 2.0|cc by 2.5|cc by-sa 2.5|cc by-nd 2.5|cc by-nc 2.5|cc by-nc-sa 2.5|cc by-nc-nd 2.5|cc by 3.0|cc by-sa 3.0|cc by-nd 3.0|cc by-nc 3.0|cc by-nc-sa 3.0|cc by-nc-nd 3.0|cc by 4.0|cc by-sa 4.0|cc by-nd 4.0|cc by-nc 4.0|cc by-nc-sa 4.0|cc by-nc-nd 4.0"/>' +
    '<optionset name="alternatemedia" values="spoken|written|signs|other_language|visual"/>' +
  '</optionsets>' +
  '<fields>' +
    '<general type="category">' +
      '<title type="text" translatable="true" enabled="true" visible="true" editable="true" required="true">' +
        '<![CDATA[Nombre corto que identifique el objeto]]>' +
      '</title>' +
      '<identifier defaultValue="{}" enabled="false" type="composed">' +
'        ' +
        '<catalog enabled="false" multiple="false" optionset-name="catalogs" type="optionset"/>' +
        '<entry enabled="false" type="text"/>' +
      '</identifier>' +
      '<language defaultValue="es" enabled="true" multiple="false" optionset-name="languages" type="optionset">' +
        'El idioma humano predominante en este Objeto para la comunicación con el usuario.' +
      '</language>' +
      '<description defaultValue="" enabled="true" type="longtext">' +
        'Una descripción textual del contenido, objetivo y actividades de este Objeto de Aprendizaje' +
      '</description>' +
      '<keywords defaultValue="" enabled="true" type="keywords">' +
        'Tenga presente que las palabras o frases deben describir de forma condensada y con sentido completo el contenido temático del Objeto. Deberán estar separadas por coma (,). Tenga presente la ortografía.' +
      '</keywords>' +
      '<coverage defaultValue="" enabled="false" type="text"/>' +
      '<structure defaultValue="" enabled="false" multiple="false" optionset-name="structures" type="optionset"/>' +
      '<aggregation_level defaultValue="" enabled="false" multiple="false" optionset-name="aggregation-levels" type="optionset"/>' +
    '</general>' +
    '<lifecycle type="category">' +
      '<version defaultValue="" enabled="true" type="text"/>' +
      '<contribution defaultValue="[]" enabled="true" type="composed" collection="true">        ' +
        '<entity enabled="true" type="vcard">' +
          'La fecha en la cual se publicó el Objeto' +
        '</entity>' +
        '<rol enabled="false" multiple="false" optionset-name="roles" type="optionset"/>' +
        '<date enabled="false" type="date"/>' +
      '</contribution>' +
    '</lifecycle>' +
    '<technical type="category">' +
      '<location defaultValue="" enabled="false" type="text"/>' +
      '<requirements defaultValue="[]" enabled="true" type="composed" collection="true">' +
'        ' +
        'Los requisitos técnicos para usar este Objeto. Incluye nombres y versiones de sistemas operativos, navegadores Web y plugins.' +
'        ' +
'        ' +
'        ' +
'        ' +
'      ' +
        '<type enabled="true" multiple="false" optionset-name="requirements_types" type="optionset"/>' +
        '<name enabled="true" type="text"/>' +
        '<minversion enabled="true" type="text"/>' +
        '<maxversion enabled="true" type="text"/>' +
      '</requirements>' +
      '<installation_remarks defaultValue="" enabled="true" type="longtext"/>' +
      '<other_platform_requirements defaultValue="" enabled="true" type="longtext"/>' +
      '<duration defaultValue="{&quot;years&quot;:0,&quot;months&quot;:0,&quot;days&quot;:0,&quot;hours&quot;:0,&quot;minutes&quot;:0,&quot;seconds&quot;:0}" enabled="true" type="duration"/>' +
    '</technical>' +
    '<educational type="category">' +
      '<interactivity_type defaultValue="" enabled="false" multiple="false" optionset-name="interactivity_types" type="optionset">' +
        'El tipo de aprendizaje predominante soportado por este Objeto. Activa: Permite al estudiante manipular, controlar, elegir acciones o introducir datos y respuestas. Expositiva: Permite al estudiante leer, navegar y visualizar información. Mixta: Mezcle los otros dos tipos con alguna proporción.        ' +
      '</interactivity_type>' +
      '<learning_resource_type defaultValue="" enabled="false" multiple="false" optionset-name="learning_resource_types" type="optionset"/>' +
      '<interactivity_level defaultValue="" enabled="false" multiple="false" optionset-name="interactivity_levels" type="optionset"/>' +
      '<semantic_density defaultValue="" enabled="false" multiple="false" optionset-name="semantic_densities" type="optionset"/>' +
      '<intended_end_user_role defaultValue="" enabled="false" multiple="false" optionset-name="user_roles" type="optionset"/>' +
      '<context defaultValue="" enabled="false" multiple="false" optionset-name="learning_contexts" type="optionset"/>' +
      '<typical_age_range defaultValue="" enabled="false" type="text"/>' +
      '<difficulty defaultValue="" enabled="false" multiple="false" optionset-name="difficulty_levels" type="optionset"/>' +
      '<typical_learning_time defaultValue="{&quot;years&quot;:0,&quot;months&quot;:0,&quot;days&quot;:0,&quot;hours&quot;:0,&quot;minutes&quot;:0,&quot;seconds&quot;:0}" enabled="false" type="duration"/>' +
      '<description defaultValue="" enabled="false" type="longtext"/>' +
      '<language defaultValue="" enabled="false" multiple="false" optionset-name="languages" type="optionset"/>' +
    '</educational>' +
    '<rights type="category">' +
      '<cost defaultValue="" enabled="true" multiple="false" optionset-name="costtypes" type="optionset"/>' +
      '<copyright defaultValue="" enabled="true" multiple="false" optionset-name="copyrights" type="optionset"/>' +
      '<description defaultValue="" enabled="true" type="longtext"/>' +
    '</rights>' +
    '<annotation type="category">' +
      '<annotation type="container" collection="true" enabled="true">' +
        '<entity defaultValue="{&quot;name&quot;:&quot;&quot;,&quot;lastname&quot;:&quot;&quot;,&quot;company&quot;:&quot;&quot;,&quot;email&quot;:&quot;&quot;}" enabled="true" type="vcard"/>' +
        '<date defaultValue="" enabled="true" type="date"/>' +
        '<description defaultValue="" enabled="true" type="longtext"/>' +
      '</annotation>' +
    '</annotation>' +
    '<clasification type="category">' +
      '<purpose defaultValue="" enabled="false" type="text"/>' +
      '<description defaultValue="" enabled="false" type="longtext"/>' +
      '<taxon_path enabled="true" type="composed" defaultValue="[{&quot;source&quot;:{&quot;default&quot;:&quot;NBC&quot;}}]">' +
        '<source enabled="true" multiple="false" optionset-name="taxon_path_sources" type="optionset"/>' +
        '<id enabled="true" multiple="false" optionset-name="taxon_path_{source}" type="optionset"/>' +
      '</taxon_path>' +
    '</clasification>' +
  '</fields>' +
'</spec>';

const rea = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
'<spec version="0.0.3">' +
  '<id>lom-co_oa</id>' +
  '<name>Objeto de Aprendizaje - LOM-CO-12</name>' +
  '<description>Objeto de Aprendizaje - LOM-CO-12</description>' +
  '<types>' +
    '<type name="duration">' +
      '<years type="int"/>' +
      '<months type="int"/>' +
      '<days type="int"/>' +
      '<hours type="int"/>' +
      '<minutes type="int"/>' +
      '<seconds type="int"/>' +
    '</type>' +
    '<type name="vcard">' +
      '<name type="string" labelId="vcard_name" required="true"/>' +
      '<lastname type="string" labelId="vcard_lastname"/>' +
      '<company type="string" labelId="vcard_company"/>' +
      '<email type="email" labelId="vcard_email" required="true"/>' +
    '</type>' +
  '</types>' +
  '<optionsets>' +
    '<optionset name="catalogs" values="ISBN|ISMN|ISSN|URI"/>' +
    '<optionset name="structures" values="atomic|collection|networked|hierarchical|linear"/>' +
    '<optionset name="aggregation-levels" values="1|2|3|4"/>' +
    '<optionset name="roles" values="author|content provider|editor|educational validator|adviser|graphical designer|initiator|instructutional designer|publisher|script writer|subject matter expert|technical implementer|technical validator|terminator|unknown|validator"/>' +
    '<optionset name="languages" values="none|ab|aa|af|ay|ak|sq|de|am|ar|an|hy|as|av|ae|az|bm|ba|bn|bh|be|my|bi|bs|br|bg|ks|km|kn|ca|ch|ce|cs|ny|zh|za|cv|si|ko|kw|co|cr|hr|da|dz|cu|sk|sl|es|eo|et|eu|ee|fo|fi|fj|fr|fy|ff|gd|cy|gl|ka|el|kl|gn|gu|ht|ha|he|hz|hi|ho|hu|io|ig|id|en|ia|iu|ik|ga|is|it|ja|jv|kr|kk|ki|ky|rn|kv|kg|kj|ku|lo|la|lv|li|ln|lt|lu|lg|lb|mk|ml|ms|dv|mg|mt|gv|mi|mr|mh|mo|mn|na|nv|nd|nr|ng|nl|ne|no|nb|nn|ie|oc|oj|or|om|os|pi|pa|ps|fa|pl|pt|qu|rm|rw|ro|ru|se|sm|sg|sa|sc|sr|st|tn|sn|sd|so|sw|ss|sv|su|tl|ty|th|ta|tt|tg|te|bo|ti|to|ts|tr|tk|tw|uk|ug|ur|uz|wa|ve|vi|vo|wl|wo|xh|ii|yi|yo|zu"/>' +
    '<optionset name="requirements_types" values="browser|operating system"/>' +
    '<optionset name="interactivity_types" values="active|expositive|mixed"/>' +
    '<optionset name="learning_resource_types" values="self assessment|problem statement|lecture|questionnaire|diagram|exercise|exam|experiment|figure|graph|index|slide|simulation|table|narrative text"/>' +
    '<optionset name="interactivity_levels" values="very low|low|medium|high|very high"/>' +
    '<optionset name="semantic_densities" values="very low|low|medium|high|very high"/>' +
    '<optionset name="user_roles" values="manager|learner|author|teacher"/>' +
    '<optionset name="learning_contexts" values="higher education|training|school|other"/>' +
    '<optionset name="difficulty_levels" values="very easy|easy|medium|difficult|very difficult"/>' +
    '<optionset name="taxon_path_sources" values="NBC"/>' +
    '<optionset name="taxon_path_NBC1" values="1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|60|61|62|63|64|65|66|67|68|69|70|71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88|89|90|91|92|93|94|95|96|97|98|99|100|101|102|103|104|105|106|107|108|109|110|111|112|113|114|115|116|117|118|119|120|121|122|123|124|125|126|127|128|129|130|131|132|133|134|135|136|137|138|139|140|141|142|143|144|145|146|147|148|149|150|151|152|153|154|155|156|157|158|159|160|161|162|163|164|165|166|167|168|169|170|171|172|173|174|175|176|177|178|179|180|181|182|183|184|185|186|187|188|189|190|191|192|193|194|195|196|197|198|199|200|201|202|203|204|205|206|207|208|209|210|211|212|213|214|215|216|217|218|219|220|221|222|223|224|225|226"/>' +
    '<optionset name="taxon_path_NBC" values="&gt;1&gt;::&gt;1&gt;12&gt;|&gt;1&gt;13&gt;||&gt;2&gt;::&gt;2&gt;24&gt;|&gt;2&gt;25&gt;|&gt;2&gt;26&gt;|&gt;2&gt;27&gt;|&gt;2&gt;28&gt;|&gt;2&gt;270&gt;||&gt;3&gt;::&gt;3&gt;313&gt;||&gt;4&gt;::&gt;4&gt;440&gt;|&gt;4&gt;441&gt;|&gt;4&gt;442&gt;|&gt;4&gt;444&gt;|&gt;4&gt;445&gt;|&gt;4&gt;446&gt;|&gt;4&gt;447&gt;|&gt;4&gt;448&gt;|&gt;4&gt;450&gt;||&gt;5&gt;::&gt;5&gt;553&gt;|&gt;5&gt;555&gt;|&gt;5&gt;556&gt;|&gt;5&gt;557&gt;|&gt;5&gt;558&gt;|&gt;5&gt;559&gt;|&gt;5&gt;561&gt;|&gt;5&gt;561&gt;|&gt;5&gt;562&gt;|&gt;5&gt;564&gt;|&gt;5&gt;566&gt;|&gt;5&gt;568&gt;|&gt;5&gt;569&gt;||&gt;6&gt;::&gt;6&gt;69&gt;|&gt;6&gt;611&gt;|&gt;6&gt;612&gt;||&gt;8&gt;::&gt;8&gt;818&gt;|&gt;8&gt;819&gt;|&gt;8&gt;820&gt;|&gt;8&gt;821&gt;|&gt;8&gt;822&gt;|&gt;8&gt;823&gt;|&gt;8&gt;824&gt;|&gt;8&gt;825&gt;|&gt;8&gt;826&gt;|&gt;8&gt;827&gt;|&gt;8&gt;828&gt;|&gt;8&gt;829&gt;|&gt;8&gt;830&gt;|&gt;8&gt;831&gt;|&gt;8&gt;832&gt;|&gt;8&gt;833&gt;||&gt;9&gt;::&gt;9&gt;934&gt;|&gt;9&gt;935&gt;|&gt;9&gt;936&gt;|&gt;9&gt;937&gt;|&gt;9&gt;939&gt;"/>' +
    '<optionset name="costtypes" values="yes|no"/>' +
    '<optionset name="copyrights" values="cc0|cc by 1.0|cc by-sa 1.0|cc by-nd 1.0|cc by-nc 1.0|cc by-nc-sa 1.0|cc by 2.0|cc by-sa 2.0|cc by-nd 2.0|cc by-nc 2.0|cc by-nc-sa 2.0|cc by-nc-nd 2.0|cc by 2.5|cc by-sa 2.5|cc by-nd 2.5|cc by-nc 2.5|cc by-nc-sa 2.5|cc by-nc-nd 2.5|cc by 3.0|cc by-sa 3.0|cc by-nd 3.0|cc by-nc 3.0|cc by-nc-sa 3.0|cc by-nc-nd 3.0|cc by 4.0|cc by-sa 4.0|cc by-nd 4.0|cc by-nc 4.0|cc by-nc-sa 4.0|cc by-nc-nd 4.0"/>' +
    '<optionset name="alternatemedia" values="spoken|written|signs|other_language|visual"/>' +
    '<optionset name="formats" values="application/ecmascript|application/flash-video|application/illustrator|application/javascript|application/msword|application/octet-stream bin|application/pdf|application/postscript ps|application/rtf|application/vnd.corel-draw|application/vnd.ms-excel|application/vnd.ms-powerpoint|application/x-asax|application/x-ascx|application/x-ashx|application/x-asmx|application/x-asp|application/x-bittorrent|application/x-bzip|application/x-bzip-compressed-tar|application/x-cd-image|application/x-chm|application/x-config|application/x-executable|application/x-font-ttf|application/x-jar|application/x-java|application/x-master-page|application/x-php|application/x-rar|application/x-rar-compressed|application/x-ruby|application/x-shellscript|application/x-shockwave-flash|application/x-web-config|application/x-wsdl|application/x-x509-ca-cert|application/xhtml+xml|application/zip|audio/ac3|audio/midi|audio/mpeg|audio/x-mp3-playlist|image/bmp|image/gif|image/jpeg|image/png|image/svg+xml|image/tiff|text/css|text/html|text/mathml|text/plain|text/x-comma-separated-values|text/x-java|text/x-log|text/x-readme|text/x-sql|text/x-vb|text/x-xsl|text/xml|video/3gpp|video/mp4|video/mpeg|video/x-ms-asf|video/x-ms-wmv|video/x-msvideo" />' +
  '</optionsets>' +
  '<fields>' +
    '<general type="category">' +
      '<title type="text" translatable="true" enabled="true" visible="true" editable="true" required="true">' +
        '<![CDATA[Nombre corto que identifique el objeto]]>' +
      '</title>' +
      '<identifier type="composed" enabled="false">' +
        '<catalog type="optionset" optionset-name="catalogs"/>' +
        '<entry type="text"/>' +
      '</identifier>' +
      '<language type="optionset" optionset-name="languages" multiple="true" enabled="true" visible="true" editable="true" required="true" defaultValue="es">' +
        '<![CDATA[El idioma humano predominante en este Objeto para la comunicación con el usuario.]]>' +
      '</language>' +
      '<description type="longtext" translatable="true" enabled="true" visible="true" editable="true" required="true">' +
        '<![CDATA[Una descripción textual del contenido, objetivo y actividades de este Objeto de Aprendizaje]]>' +
      '</description>' +
      '<keywords type="keywords" translatable="true" enabled="true" visible="true" editable="true" required="true">' +
        '<![CDATA[Tenga presente que las palabras o frases deben describir de forma condensada y con sentido completo el contenido temático del Objeto. Deberán estar separadas por coma (,). Tenga presente la ortografía.]]>' +
      '</keywords>' +
      '<coverage type="text" enabled="false"/>' +
      '<structure type="optionset" optionset-name="structures" enabled="false" />' +
      '<aggregation_level type="optionset" optionset-name="aggregation-levels" enabled="false"/>' +
    '</general>' +
    '<lifecycle type="category">' +
      '<version type="text" enabled="true" visible="true" editable="false" required="true" defaultValue="1.0"/>' +
      '<contribution type="composed" enabled="true" collection="true">' +
        '<entity type="vcard" enabled="true" visible="true" editable="true" required="true"/>' +
        '<rol type="optionset" optionset-name="roles" enabled="true" visible="true" editable="true" required="true"/>' +
        '<date type="datetime" enabled="true" visible="true" editable="true" required="true">' +
          '<![CDATA[La fecha en la que se hizo la contribución]]>' +
        '</date>        ' +
      '</contribution>' +
    '</lifecycle>' +
    '<technical type="category">' +
      '<format type="optionset" optionset-name="formats" enabled="true" required="true" editable="true"/>' +
      '<location type="text" enabled="true" visible="true" editable="true" required="false"/>' +
      '<requirements type="composed" enabled="true" visible="true" editable="true" required="false" collection="true">' +
        '<![CDATA[Los requisitos técnicos para usar este Objeto. Incluye nombres y versiones de sistemas operativos, navegadores Web y plugins.]]>' +
        '<type type="optionset" optionset-name="requirements_types" enabled="true" visible="true" editable="true" required="false"/>' +
        '<name type="text" enabled="true" visible="true" editable="true" required="false"/>' +
        '<minversion type="text" enabled="true" visible="true" editable="true" required="false"/>' +
        '<maxversion type="text" enabled="true" visible="true" editable="true" required="false"/>' +
      '</requirements>' +
      '<installation_remarks type="longtext" enabled="false" visible="true" editable="true" required="false"/>' +
      '<other_platform_requirements type="longtext" enabled="false"/>' +
      '<duration type="duration" enabled="false" collection="false" replicatable="false"/>' +
      '<alternate_media type="optionset" optionset-name="alternatemedia" enabled="true" visible="true" editable="true" required="false" multiple="true" />' +
    '</technical>' +
    '<educational type="category">' +
      '<interactivity_type type="optionset" optionset-name="interactivity_types" enabled="false" visible="true" editable="true" required="false">' +
        '<![CDATA[El tipo de aprendizaje predominante soportado por este Objeto. Activa: Permite al estudiante manipular, controlar, elegir acciones o introducir datos y respuestas. Expositiva: Permite al estudiante leer, navegar y visualizar información. Mixta: Mezcle los otros dos tipos con alguna proporción.]]>        ' +
      '</interactivity_type>' +
      '<learning_resource_type type="optionset" optionset-name="learning_resource_types" enabled="true" visible="true" editable="true" required="false"/>' +
      '<interactivity_level type="optionset" optionset-name="interactivity_levels" enabled="false" visible="true" editable="true" required="false"/>' +
      '<semantic_density type="optionset" optionset-name="semantic_densities" enabled="false"/>' +
      '<intended_end_user_role type="optionset" optionset-name="user_roles" enabled="false" visible="true" editable="true" required="true"/>' +
      '<context type="optionset" optionset-name="learning_contexts" enabled="false" visible="true" editable="true" required="true" defaultValue=""/>' +
      '<typical_age_range type="text" enabled="false"/>' +
      '<difficulty type="optionset" optionset-name="difficulty_levels" enabled="false"/>' +
      '<typical_learning_time type="optionset" enabled="false"/>' +
      '<description type="longtext" enabled="false"/>' +
      '<language type="optionset" optionset-name="languages" enabled="false"/>' +
    '</educational>' +
    '<rights type="category">' +
      '<cost type="optionset" optionset-name="costtypes" visible="true" editable="true" required="true" enabled="true" defaultValue="no" />' +
      '<copyright type="optionset" optionset-name="copyrights" enabled="true" visible="true" editable="true" required="true"/>' +
      '<description type="longtext" enabled="true" visible="true" editable="true" required="false" translatable="true"/>' +
    '</rights>' +
    '<annotation type="category">' +
      '<annotation type="container" collection="true" enabled="true">' +
        '<entity type="vcard" enabled="true" visible="true" editable="true" required="false"/>' +
        '<date type="date" enabled="true" visible="true" editable="true" required="false"/>' +
        '<description type="longtext" enabled="true" visible="true" editable="true" required="false"/>' +
      '</annotation>' +
    '</annotation>' +
    '<clasification type="category">' +
      '<purpose enabled="false"/>' +
      '<description enabled="false"/>' +
      '<taxon_path type="composed" collection="true" enabled="true" required="true" fixed="true" default="[{&quot;source&quot;:{&quot;default&quot;:&quot;NBC&quot;}}]">' +
        '<source type="text" enabled="true" editable="false"/>' +
        '<id type="optionset" optionset-name="taxon_path_{source}" enabled="true" visible="true" editable="true" multiple="true">' +
        '<![CDATA[El camino taxonómico dentro del sistema de clasificación NBC. Cada nivel sucesivo representa un refinamiento sobre la definición dada en el nivel precedente. Ej: Ingeniería -> Ingeniería Civil]]>' +
        '</id>' +
      '</taxon_path>' +
    '</clasification>' +
  '</fields>' +
'</spec>';

export const specs = {
  'rea': rea,
  'obi': red,
  'red': red
};
