angular.module('tutsApp', []);

$(document).ready(function() {
  $('.tree > ul').attr('role', 'tree').find('ul').attr('role', 'group');
  $('.tree').find('li:has(ul)').addClass('parent_li').attr('role', 'treeitem').find(' > span').on('click', function (e) {
        var children = $(this).parent('li.parent_li').find(' > ul > li');
        if (children.is(':visible')) {
        children.hide('fast');
        $(this).addClass('glyphicon-plus-sign').removeClass('glyphicon-minus-sign');
        }
        else {
        children.show('fast');
        $(this).addClass('glyphicon-minus-sign').removeClass('glyphicon-plus-sign');
        }
        e.stopPropagation();
    });
});