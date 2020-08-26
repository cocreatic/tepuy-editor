$.fn.tepuyVerticalMenu = function() {
    this.each(function(){

        var $this = $(this);
        var $chalkboard_items = $('<div class="chalkboard_vertical_items board"></div>');
        var $chalkboard_content = $('<div class="chalkboard_vertical_content elements"></div>');

        $this.find('>dl').each(function() {
            var $dl = $(this);

            var $dd= $('<div class="element rule_1 tab_content"></div>');
            $dd.append($dl.find('>dd').children());
            var $dt = $('<div class="chalkboard_vertical_item button">' + $dl.find('dt').html() + '</div>').on('click', function(){
                var $item_dt = $(this);
                $chalkboard_content.find('> .element').hide();
                $chalkboard_items.find('.current').removeClass('current');
                $item_dt.addClass('current');
                $dd.show();
            });

            $dt.on('mouseover', dhbgApp.defaultValues.buttonover);

            $dt.on('mouseout', dhbgApp.defaultValues.buttonout);

            $chalkboard_items.append($dt);

            $chalkboard_content.append($dd);
        });

        $chalkboard_content.find('> .element').hide();
        $chalkboard_items.find(':first-child').addClass('current');
        $chalkboard_items.find(':last-child').addClass('last-item');
        $chalkboard_content.find('> .element:first-child').show();
        $this.empty();

        $this.append($chalkboard_items);
        $this.append($chalkboard_content);
        $this.append('<div class="clear"></div>');

    });
}