///////////////////////
// preparePluslets FUNCTION
// called to prepare all the pluslets before saving them
///////////////////////

function preparePluslets(lstrType, lintID, lobjThis) {
	var lboolSettingsOnly = false;
	var lstrInstance;
	var lstrTitle;
	var lstrDiv;
	var lintUID;
	var pbody;
	var pitem_type;
	var pspecial;
	var ourflag;
	var isclone;

	//based on type set variables
	
	//console.log(lstrType.toLowerCase());
	
	switch (lstrType.toLowerCase()) {
	case "modified": {
		//used to get contents of CKeditor box
		lstrInstance = "pluslet-update-body-" + lintID;
		//Title of item
        if($("#pluslet-update-title-" + lintID).val() == null) {
            b = $(".pluslet-" + lintID).find('.titlebar_text').clone();
            b.children().remove();
            lstrTitle = b.text().trim();
        } else {
            lstrTitle = addslashes($("#pluslet-update-title-" + lintID).val());
        }





        //console.log(lintID);
		//console.log(lstrTitle);
		//console.log("Title modified!");
		if (lstrTitle === undefined) {
			b = $(".pluslet-" + lintID).find('.titlebar_text').clone();
			b.children().remove();
			lstrTitle = b.text().trim();
			lboolSettingsOnly = true;
		}

		//Div Selector
		lstrDiv = "#pluslet-" + lintID;
		//depending update_id
		lintUID = lintID;
		break;
	}
	case "new": {
		//used to get contents of CKeditor box
		lstrInstance = "pluslet-new-body-" + lintID;
		//Title of item
		lstrTitle = addslashes($("#pluslet-new-title-" + lintID).val());
		//Div Selector
		lstrDiv = "#" + lintID;
		//depending update_id
		lintUID = '';
		break;
	}
	}

	///////////////////////////////////////////////////////////////
	// The box settings  are available on all pluslets potentially
	// --they determine if titlebar shows, titlebar styling, if body
	// is collapsed by default, and if body is suppressed (for a header pluslet)
	////////////////////////////////////////////////////////////////

	var boxsetting_hide_titlebar = Number($('input[id=notitle-' + lintID + ']')
			.is(':checked'));
	var boxsetting_collapse_titlebar = Number($(
			'input[id=start-collapsed-' + lintID + ']').is(':checked'));
	var boxsetting_titlebar_styling = $(
			'select[id=titlebar-styling-' + lintID + ']').val();

    var favorite_box = Number($('input[id=favorite_box-' + lintID + ']')
        .is(':checked'));

	var boxsetting_target_blank_links = Number($('input[id=target_blank_links-' + lintID + ']')
		.is(':checked'));

	//////////////////////////////////////////////////////////////////
	// Check the pluslet's "name" value to see if there is a number
	// --If it is numeric, it's a "normal" item with a ckeditor instance
	// collecting the "body" information
	//////////////////////////////////////////////////////////////

	var item_type = $(lobjThis).attr("name").split("-");

	// Loop through the box types
	switch (item_type[2]) {
	case "Basic":
		if (typeof CKEDITOR !== 'undefined' && !lboolSettingsOnly) {

			pbody = addslashes(CKEDITOR.instances[lstrInstance].getData());

		} else {

			pbody = $('#pluslet-' + lintID).find('.pluslet_body').html();
		}

		pitem_type = "Basic";
		pspecial = '';
		break;
	case "Heading":
		pbody = ""; // headings have no body
		pitem_type = "Heading";

		break;
	case "TOC":
		pbody = "";
		pitem_type = "TOC";
		var tickedBoxes = [];
		$('input[name=checkbox-' + lintID + ']:checked').each(function() {

			tickedBoxes.push(this.value);

		});

		pspecial = '{"ticked":"' + tickedBoxes + '"}';

		break;
	case "Feed":
		pbody = $('input[name=' + lstrInstance + ']').val();
		var pfeed_type = $('select[name=feed_type-' + lintID + ']').val();
		var pnum_items = $('input[name=displaynum-' + lintID + ']').val();
		var pshow_desc = $('input[name=showdesc-' + lintID + ']:checked').val();
		var pshow_feed = $('input[name=showfeed-' + lintID + ']:checked').val();

		pspecial = '{"num_items":' + pnum_items + ',  "show_desc":'
				+ pshow_desc + ', "show_feed": ' + pshow_feed
				+ ', "feed_type": "' + pfeed_type + '"}';

		pitem_type = "Feed";
		break;

	default:

		pbody = $('#' + item_type[2] + '-body').html();
		pbody = pbody === undefined ? "" : pbody;
		pitem_type = item_type[2];
		var extra = {};

		//parse text inputs to create extra fields
		$(lobjThis).find('input[name^=' + item_type[2] + '-extra][type=text]')
				.each(function() {
					var name_split = $(this).attr("name").split("-");
					extra[name_split[2]] = $(this).val();
				});

		//parse textareas to create extra fields
		$(lobjThis).find('textarea[name^=' + item_type[2] + '-extra]').each(
				function() {
					var name_split = $(this).attr("name").split("-");
					extra[name_split[2]] = $(this).val();
				});

		//parse selectboxes to create extra fields
		$(lobjThis).find('select[name^=' + item_type[2] + '-extra]').each(
				function() {
					var name_split = $(this).attr("name").split("-");
					extra[name_split[2]] = $(this).val();
				});

		//parse radio inputs to create extra fields
		$(lobjThis)
				.find('input[name^=' + item_type[2] + '-extra][type=radio]')
				.each(
						function() {
							var name_split = $(this).attr("name").split("-");
							extra[name_split[2]] = typeof extra[name_split[2]] === 'undefined' ? ''
									: extra[name_split[2]];

							if ($(this).is(':checked'))
								extra[name_split[2]] = $(this).val();
						});

		//parse checkboxe inputs to create extra fields
		$(lobjThis)
				.find('input[name^=' + item_type[2] + '-extra][type=checkbox]')
				.each(
						function() {
							var name_split = $(this).attr("name").split("-");
							extra[name_split[2]] = typeof extra[name_split[2]] === 'undefined' ? []
									: extra[name_split[2]];

							if ($(this).is(':checked'))
								extra[name_split[2]].push($(this).val());
						});

		pspecial = $.isEmptyObject(extra) ? "" : JSON.stringify(extra);

		break;
	}

	//only check clone if modified pluslet
	if (lstrType === 'modified') {
		//////////////////////
		// Clone?
		// If it's a clone, add a new entry to DB
		/////////////////////

		//console.log(lintID);
		var clone = $("#pluslet-" + lintID).attr("class");

		//console.log(clone);
		if (clone.indexOf("clone") !== -1) {
			ourflag = 'insert';
			isclone = 1;

		} else {
			ourflag = 'update';
			isclone = 0;
		}

		//only settings update
		if (lboolSettingsOnly) {
			ourflag = 'settings';
		}
	} else {
		ourflag = 'insert';
		isclone = 0;
	}

	////////////////////////
	// Post the data to guide_data.php
	// which will do an insert or update as appropriate
	//
	// **changed by dgonzalez 08/2013 so that request is not done
	// asynchronously so that setTimeout to save guide is no longer needed.
	////////////////////////

	$.ajax({
				url : "helpers/guide_data.php",
				data : {
					update_id : lintUID,
					pluslet_title : lstrTitle,
					pluslet_body : pbody,
					flag : ourflag,
					staff_id : user_id,
					item_type : pitem_type,
					clone : isclone,
					special : pspecial,
					this_subject_id : subject_id,
					boxsetting_hide_titlebar : boxsetting_hide_titlebar,
					boxsetting_collapse_titlebar : boxsetting_collapse_titlebar,
					boxsetting_titlebar_styling : boxsetting_titlebar_styling,
                    favorite_box : favorite_box,
					boxsetting_target_blank_links: boxsetting_target_blank_links

				},
				type : "POST",
				success : function(response) {
					var this_div;

					//load response into pluslet
					$(lstrDiv).html(response);

					// check if it's an insert or an update, and name div accordingly
					if (ourflag === "update" || ourflag === "settings"
							|| isclone === 1) {
						this_div = '#pluslet-' + lintID;
					} else {
						this_div = '#' + lintID;
					}

					// 1.  remove the wrapper
					// 2. put the contents of the div into a variable
					// 3.  replace parent div (i.e., id="xxxxxx") with the content made by loaded file
					var cnt = $(this_div).contents();

					$(this_div).replaceWith(cnt);
				},
				async : false
			});
}