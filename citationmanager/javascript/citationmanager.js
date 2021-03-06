/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
var sakai = sakai ||
{};

/**
 * Initialize the citaiton manager  widget
 * @param {Object} tuid
 * @param {Object} showSettings
 */
sakai.citationmanager = function(tuid, showSettings){
    ///////////////////////////
    //Configuration Variables//
    //////////////////////////
    var citation_info;//Object That holds all the citatons of a user
    var count_private = 0;//holds the private citations count 
    var $citationManagerMainTemplate = "citationmanager_main_citations_template";
   
   		//Page Variables
    var pageCurrent = 0;//the current page for paging
    var pageSize = 5;//number of items to be shown in a page
   
  		 //Arrays
    var citationsArray = [];//array that contations citations.each element is a citaiton 
    var parseCitations = [];//parse the returned citaitons from loadJSON
    var parseSearch = [];//holds the citations returned after search
    var citaitons = [];//array that contains a users citaions this is basically a copy of paging array intended for deleting and adding comments
   
   		//Proxy Variables
    sakai.config.URL.CONNOTEA_AUTHENTICATE_PROXY = "/var/proxy/citationmanager/connotea.json";//connotea Authenticate proxy
    sakai.config.URL.CONNOTEA_FETCH_PROXY = "/var/proxy/citationmanager/connotea_import.json";//connotea fetch_bookmarks proxy
   
   
   		//Counters
	var count = 1;
    var citation_private;//used for deleting public citations
    var citation_public;//used for deleting private citations
    
	
	
	////////////////////////
	//CONNOTEA IMPORT /////
	//////////////////////
	/**
     * Parse the imported data from Connotea database to determine if the user's credentials are valid
     * @param {Object} xml
     */
    function parseXml(xml){
    
        $(xml).find("Response").each(function(){
            //Response is an element in the XML returned by connotea
            //$("#cite").append($(this).find("code").text() + "<br />").val()
        
        });
        
        
    }
    
    /**
     * Authenticates A user against the connotea database
     */
    function authenticate_connotea(){
        $("#connotea_authenticate").live("click", function(){
            $.ajax({
                cache: false,
                
                url: sakai.config.URL.CONNOTEA_AUTHENTICATE_PROXY,
                success: function(data){
                    parseResponse(data);
                    
                    
                },
                error: function(xhr, textStatus, thrownError){
                    alert("Sorry could'nt make the required request " + sakai.data);
                },
                data: {
                    ":basic-user": $("#uname").val(),
                    ":basic-password": $("#pass").val()
                }
            });
            
        });
    }
	
	
	
    //////////////////
    /// PAGING    ///
    ////////////////
    /**
     * Initializes the changed page
     * @param {Integer} clickedPage clickedPage the page which has been clicked and should be displayed
     */
    var doPaging = function(clickedPage){
    
        // Adjust pageCurrent (pageCurrent is zero-based)
        pageCurrent = clickedPage - 1;
        
        renderCitations("currentUser");
    };
    /**Temporary solution for multiple paging for data returned from fetch and search 
     *
     * @param {Object} clickedPage clickedPage the page which has been clicked and should be displayed
     */
    var doPagingFetch = function(clickedPage){
    
        // Adjust pageCurrent (pageCurrent is zero-based)
        pageCurrent = clickedPage - 1;
        
        renderCitations("fetch");
    };
    /**
     * Temporary solution for multiple paging for data returned from fetch and search
     * @param {Object} clickedPage clickedPage the page which has been clicked and should be displayed
     */
    var doPagingSearch = function(clickedPage){
    
        // Adjust pageCurrent (pageCurrent is zero-based)
        pageCurrent = clickedPage - 1;
        
        renderCitations("search");
    };
    /**
     *  Paging function
     * @param {Object} arraylength The length of the array which holds the citaitons
     * @param {Object} type Type of citaiton weather it is returned from fetch or search or from the current user's public and private list
     */
    var renderPaging = function(arraylength, type){
        if (type == "currentUser") {
            $(".jq_pager1").pager({
                pagenumber: pageCurrent + 1,
                pagecount: Math.ceil(arraylength / pageSize),
                buttonClickCallback: doPaging
            });
        }
        else 
            if (type == "fetch") {
                $(".jq_pager1_fetch").pager({
                    pagenumber: pageCurrent + 1,
                    pagecount: Math.ceil(arraylength / pageSize),
                    buttonClickCallback: doPagingFetch
                });
            }
            else 
                if (type == "search") {
                    $(".jq_pager1_search").pager({
                        pagenumber: pageCurrent + 1,
                        pagecount: Math.ceil(arraylength / pageSize),
                        buttonClickCallback: doPagingSearch
                    });
                }
    };
	
	
	////////////////////////
	////RENDER CITATIONS///
	///////////////////////
	
    /**
     * Render the Citations of a user
     * @param {Object} type The type of reference bsed on storage path like public or private
     */
    function renderCitations(type){
        if (type == "currentUser") {
            var parseCitationsArray = [];//holds the citations of a user each element is a citation 
            for (var b in parseCitations.all) {
                if (parseCitations.all.hasOwnProperty(b)) {
                    parseCitationsArray.push(parseCitations.all[b]);
                }
            }
            citationsArray = parseCitationsArray;//this is used to duplicate the array for delete purposes
            var pagingArray = {
                all: parseCitationsArray.slice(pageCurrent * pageSize, (pageCurrent * pageSize) + pageSize)
            };//paging array will hold the elements based on the size of the page size currently 5
            //Actually view the citations 
            $("#public_citations_view").html($.TemplateRenderer("citationmanager_main_citations_template", pagingArray));
            if (parseCitationsArray.length > pageSize) {
                //Hide the unnecessary pagers and show only the required one
                $("#citation_pager").show();
                $("#citation_pager_fetch").hide();
                $("#citation_pager_search").hide();
                
                renderPaging(parseCitationsArray.length, "currentUser");
            }
        }
        else if (type == "search") {
                //alert("asd");
                
                var parseSearchArray = [];//holds the citations of a user each element is a citation 
                var count_search = 0;//used for testing only 
                for (var b in parseSearch.all) {
                    if (parseSearch.all.hasOwnProperty(b)) {
                        parseSearchArray.push(parseSearch.all[b]);
                        count_search++;
                    }
                }
				
                //alert(parseSearchArray[0].UR);
                //var citationsArray1=parseSearchArray;//this is used to duplicate the array for delete purposes
                var pagingArray2 = {
                     all2: parseSearchArray.slice(pageCurrent * pageSize, (pageCurrent * pageSize) + pageSize) //paging array will hold the elements based on the size of the page size currently 5
                };
                //Actually view the citations 
                $("#searchView").html($.TemplateRenderer("citationmanager_main_search_template", pagingArray2));//render the tempate
                if (parseSearchArray.length > pageSize) {
                
                    //Hide the unnecessary pagers and show only the required one
                    $("#citation_pager").hide();
                    $("#citation_pager_search").show();
                    $("#citation_pager_fetch").hide();
                    
                    
                    renderPaging(parseSearchArray.length, "search");
                }
            }
            else 
                if (type == "fetch") {
                    //alert("asd");
                    var parseFetchArray = [];//holds the citations of a user each element is a citation 
                    for (var b in parsefetch.all) {
                        if (parsefetch.all.hasOwnProperty(b)) {
                            parseFetchArray.push(parsefetch.all[b]);
                        }
                    }
                    //alert(parseSearchArray[0].UR);
                    var citationsArray1 = parseFetchArray;//this is used to duplicate the array for delete purposes
                    var pagingArray1 = {
                        all1: parseFetchArray.slice(pageCurrent * pageSize, (pageCurrent * pageSize) + pageSize)
                    };//paging array will hold the elements based on the size of the page size currently 5
                    //Actually view the citations 
                    $("#fetchView").html($.TemplateRenderer("citationmanager_main_fetch_template", pagingArray1));
                    if (parseFetchArray.length > pageSize) {
                        //Hide the unnecessary pagers and show only the required one
                        $("#citation_pager_fetch").show();
                        $("#citation_pager").hide();
                        $("#citation_pager_search").hide();
                        
                        renderPaging(parseFetchArray.length, "fetch");
                    }
                }
        
    }
	
	
	/////////////////////////////////////
	///CITATION INFO AND SETTINGS///////
	///////////////////////////////////
    
    /**
     * Show or hide the other properties of a citations This function is from delicious widget
     */
    var showHideCitationManagerBookmarkInfo = function(){
        $(".citationmanager_main_bookmark_info_link").die();//to prevent multiple click events
        $(".citationmanager_main_bookmark_info_link").live("click", function(){
        
            // Define unique info ID, based on link ID
            var elementID = '#' + $(this).attr("id") + '_info';
            
            
            // If visible: hide information and swap image
            if ($(this).hasClass("citationmanager_showArrowLeft")) {
                $(elementID).slideUp(150);
                $(this).removeClass("citationmanager_showArrowLeft");
            }
            // Else: show information and swap image
            else {
                $(elementID).slideDown(150);
                $(this).addClass("citationmanager_showArrowLeft");
            }
        });
    };
	
	 /**
     * Deletes a user's citaiton  
     */
    function deleteCitation(){
        $(".user-icon").die();
        $(".user-icon").live("click", function(){
            var delete_citaiton = $(this).attr("id");
            citationsArray.splice(delete_citaiton, 1);
            var citationsArrayAfterDelete = citationsArray;
            if (citation_private == 1) {
                sakai.api.Server.removeJSON("/_user" + sakai.data.me.profile.path + "/private/citationdata", function(){
                    sakai.api.Server.saveJSON("/_user" + sakai.data.me.profile.path + "/private/citationdata", citationsArrayAfterDelete, alert("data saved"));
                    citation_private = 0;
                });
            }
            else 
                if (citation_public == 1) {
                    sakai.api.Server.removeJSON("/_user" + sakai.data.me.profile.path + "/public/citationdata", function(){
                        sakai.api.Server.saveJSON("/_user" + sakai.data.me.profile.path + "/public/citationdata", citationsArrayAfterDelete, alert("data saved"));
                        citation_public = 0;
                    });
                }
            
            
        });
    }
	
	  /**
     * Adds the a specific citation from public list or from the fetched citaitons or from the search list to the users list
     */
    function addToPrivate(){
        $(".addToPrivate").die();
        $(".addToPrivate").live("click", function(){
            var citation = $(this).attr("id").split("_", 2)[1];
            //alert(citation);
            sakai.api.Server.loadJSON("/_user" + sakai.data.me.profile.path + "/public/citationdata", function(success, data){
                if (success) {
                    var JSONArray = {
                        all: data
                    };
                    var Array = [];//holds the citations of a user each element is a citation 
                    for (var a in data) {
                        if (data.hasOwnProperty(a)) {
                            Array.push(data[a]);
                            
                        }
                    }
                    var citationToAdd = Array[citation];
                    sakai.api.Server.loadJSON("/_user" + sakai.data.me.profile.path + "/private/citationdata", function(success, data){
                        if (success) {
                            citation_info = data;
                            for (var key in citation_info) {
                                if (citation_info.hasOwnProperty(key)) {
                                    count_private++;//findout the current number of citations.
                                }
                            }
                        }
                        else {
                            //If the data is not returned that means there are no ciations so add Citations for the first time
                            sakai.api.Server.saveJSON("/_user" + sakai.data.me.profile.path + "/private/citationdata", citationToAdd, function(){
                                //$("#citations_after").html("<label class=citations_view >Data Added</label>").fadeOut(4000);
                            });//The above will add the citations and show the message "Data Added"
                        }
                        //if there are citations add new citations after the current number
                        citation_info[count_private] = citationToAdd;//add to the end of the json array
                        sakai.api.Server.saveJSON("/_user" + sakai.data.me.profile.path + "/private/citationdata", citation_info, function(){
                            //$("#citations_after").html("<label class=citations_view >Data Added</label>").fadeOut(4000);
                        });
                    });
                    
                    
                }
            });
        });
    }
    
    /////////////////////////////////
	///ADD CITATIONS AND COMMENTS///
    ///////////////////////////////
    
	/**
     * Add the users citations to either public or private paths
     */
    function addCitations(){
        $("#addnotetextarea").hide();
        $("#add").toggle();
        $("#addnote").die();
        //The notes text area
        $("#addnote").live("click", function(){
            $("#addnotetextarea").toggle('slow');//toggle the notes text area
        })
        //cliclking on addpublic will trigger this
        $("#addpublic").live("click", function(){
            //Validating the input 
            if ($("url").val() == "" || $("#author").val() == "" || $("#publication_year").val() == "" || $("#title").val() == "") {
                $("#add_error").html("Please enter * marked values");
                
            }
            else {
                $("#add_error").remove();//remove the error div and add the citaitons
                var count_public = 0;//holds the public citaitons count
                //sakai.api.Server.removeJSON("/_user" +sakai.data.me.profile.path+"/public/citationdata",alert('asdasd'));
                sakai.api.Server.loadJSON("/_user" + sakai.data.me.profile.path + "/public/citationdata", function(success, data){
                    if (success) {
                    
                        citation_info = data;//citation info holds the citaitons 
                        for (var key in citation_info) {
                            if (citation_info.hasOwnProperty(key)) {
                                count_public++;//findout the current number of citations.
                            }
                        }
                        
                    }
                    else {
                        //If the data is not returned that means there are no ciations so add Citations for the first time
                        var data2 = [{
                            "UR": $("#url").val(),
                            "AU": $("#author").val(),
                            "T1": $("#title").val(),
                            "TY": $("#typeofref").val(),
                            "N1": $("#addnotetextarea").val(),
                            "sling:resourceType": "sakai:citation",
                            "KW": $("#tag").val()
                        
                        }]
                        sakai.api.Server.saveJSON("/_user" + sakai.data.me.profile.path + "/public/citationdata", data2, function(){
                            $("#citations_add").after("<label class=citations_view >Data Added</label>");
                        });
                        //The above will add the citations and show the message "Data Added"
                    }
                    
                    //if there are citations add new citations after the current number
                    var data1 = {
                        "UR": $("#url").val(),
                        "AU": $("#author").val(),
                        "T1": $("#title").val(),
                        "TY": $("#typeofref").val(),
                        "N1": $("#addnotetextarea").val(),
                        "sling:resourceType": "sakai:citation",
                        "KW": $("#tag").val()
                    }
                    citation_info[count_public] = data1;//add to the end of the json array
                    sakai.api.Server.saveJSON("/_user" + sakai.data.me.profile.path + "/public/citationdata", citation_info, function(){
                        $("#citations_after").html("<label class=citations_view >Data Added</label>").fadeOut(4000);
                    });
                });
            }
            
            
        });
        //This will trigger when citations are added to the private path
        $("#addprivate").live("click", function(){
            if ($("url").val() == "" || $("#author").val() == "" || $("#publication_year").val() == "" || $("#title").val() == "") {
                $("#add_error").html("Please enter * marked values");
                
            }
            else {
                sakai.api.Server.loadJSON("/_user" + sakai.data.me.profile.path + "/private/citationdata", function(success, data){
                
                    if (success) {
                        citation_info = data;
                        for (var key in citation_info) {
                            if (citation_info.hasOwnProperty(key)) {
                                count_private++;//findout the current number of citations.
                            }
                        }
                    }
                    else {
                        //If the data is not returned that means there are no ciations so add Citations for the first time
                        var data2 = [{
                            "UR": $("#url").val(),
                            "AU": $("#author").val(),
                            "T1": $("#title").val(),
                            "TY": $("#typeofref").val(),
                            "N1": $("#addnotetextarea").val(),
                            "KW": $("#tag").val()
                        
                        }]
                        
                        sakai.api.Server.saveJSON("/_user" + sakai.data.me.profile.path + "/private/citationdata", data2, function(){
                            $("#citations_after").html("<label class=citations_view >Data Added</label>").fadeOut(4000);
                        });//The above will add the citations and show the message "Data Added"
                    }
                    //if there are citations add new citations after the current number
                    var data1 = {
                        "UR": $("#url").val(),
                        "AU": $("#author").val(),
                        "T1": $("#title").val(),
                        "TY": $("#typeofref").val(),
                        "N1": $("#addnotetextarea").val(),
                        "KW": $("#tag").val()
                    
                    }
                    citation_info[count_private] = data1;//add to the end of the json array
                    sakai.api.Server.saveJSON("/_user" + sakai.data.me.profile.path + "/private/citationdata", citation_info, function(){
                        $("#citations_after").html("<label class=citations_view >Data Added</label>").fadeOut(4000);
                    });
                });
            }
            
            
        });
    }
    /**
     * Add comments to a citaiton.
     */
    function addAndShowComments(){
    
        ////////////////////////
        //All die functions are used to prevent multiple click events 
        
        $(".comments_button1").die();
        $("#showcomment").die();
        $("#hidecomment").die();
        
        ///////////////////////
        
        
        
        //THis will trigger when the user clicks on addcomment button 
        $(".comments_button1").live("click", function(){
            var comments = $(this).prev().val();//this will hold the comments
            //console.log(comments);
            var parentId = $(this).parent().attr("id");
            var citation_number = $(this).attr("id").split("_", 1);//this holds the citaiton number for which comments are being added
            alert(citation_number);
            var username_comment = sakai.data.me.user.userid;//the user who is commenting
            //alert(username_comment);
            sakai.api.Server.loadJSON("/_user" + sakai.data.me.profile.path + "/public/commentsForCitations", function(success, data){
                if (success) {
                    var comment_count = 0;
                    citation_info = data;//citation_info holds all the comments
                    for (var comment in citation_info) {
                        if (citation_info.hasOwnProperty(comment)) {
                            comment_count++;
                        }
                    }
                    //alert(comment_count);
                }
                else {
                    //console.log(comments);
                    var comment_data = [{
                        "user": username_comment,
                        "comment": comments,
                        "Comment_for": citation_number
                    }]
                    
                    //save the comments follows the same logic as add citations
                    sakai.api.Server.saveJSON("/_user" + sakai.data.me.profile.path + "/public/commentsForCitations", comment_data, function(success){
                        if (success) {
                            //Tell the user that the comment has been added
                            $("#citationmanager_main_bookmark").after("<label class=input_class_comment >Comment Added</label>");
                            //$("#citationmanager_main_bookmark").hide();
                            $("#citationmanager_main_bookmark").parent().find(".input_class_comment").remove();
                            
                        }
                        else {
                            $("#citationmanager_main_bookmark").after("<label class=input_class_comment >Please Try Again</label>");
                            $("#citationmanager_main_bookmark").parent().find(".input_class_comment").remove();
                        }
                        
                    });
                    
                }
                //console.log(comments);
                var comment_data = {
                    "user": username_comment,
                    "comment": comments,
                    "Comment_for": citation_number
                }
                
                citation_info[comment_count] = comment_data;
                
                sakai.api.Server.saveJSON("/_user" + sakai.data.me.profile.path + "/public/commentsForCitations", citation_info, function(success){
                    if (success) {
                        $("#citationmanager_main_bookmark").after("<label class=input_class_comment >Comment Added</label>");
                        //$("#citationmanager_main_bookmark").hide();
                        $("#citationmanager_main_bookmark").parent().find(".input_class_comment").fadeOut('slow');
                        
                    }
                    else {
                        $("#citationmanager_main_bookmark").after("<label class=input_class_comment >Please Try Again</label>");
                        $("#citationmanager_main_bookmark").parent().find(".input_class_comment").fadeOut('slow');
                    }
                    
                });
            });
            //var comment_Citation=citationsArray.slice(citation,1);
        
        
        });
        
        
        $("#showcomment").die();
        var count = 0;
        
        $("#showcomment").live("click", function(){
        
            //$(this).hide();//hide the showcomments link
            //sakai.api.Server.removeJSON("/_user"+sakai.data.me.profile.path+"/public/commentsForCitations",alert("ad"));
            //alert(this);
            var commentFor = $(this).parent().attr("id").split("_", 3);//array used for getting the citation number
            var commentForCitation = commentFor[2];//holds the citation number for which comments have to be shown
            //console.log(commentForCitation);
            sakai.api.Server.loadJSON("/_user" + sakai.data.me.profile.path + "/public/commentsForCitations", function(success, data){
                if (success) {
                    //alert("hello");
                    parseComments = {
                        all: data
                    };
                    var parseCommentsArray = [];
                    var numberOfComments = 0;
                    for (var b in parseComments.all) {
                        if (parseComments.all.hasOwnProperty(b)) {
                            parseCommentsArray.push(parseComments.all[b]);//holds the comments 
                        }
                        numberOfComments++;
                    }
                    //alert(numberOfComments);
                    //$(this).before(numberOfComments);
                    
                    
                    
                    
                    //$("#citation_comments_"+commentForCitation).addClass('comments_citaions');
                    
                    commentsArray = parseCommentsArray;//commentsArray has all the comments
                    //alert(commentsArray.length);
                    var elementID = "hide_" + commentForCitation;
                    var editID = "edit_" + commentForCitation;
                    
                    $("#citation_comments_" + commentForCitation).html(" ");//to prevent mulitple appends after hiding comments
                    //alert(commentsArray.length);
                    for (var i = 0; i < commentsArray.length; i++) {
                        if (commentsArray[i].Comment_for == commentForCitation) {//check if the comment I am showing is for the current citation This could use more CPU but its working
                            $("#citation_comments_" + commentForCitation).append("<div class=comments_citaions_div id=comment_" + i + "><a href=javascript:; ><img src=\"/devwidgets/citationmanager/images/comments.jpg\" style=\"float:right;\" id=" + editID + " class=editComments /></a>Comment By: " + commentsArray[i].user + "<br/><label id =label_" + i + " >Comment: " + commentsArray[i].comment + "</label></div><br/>");
                        }
                        
                    }
                    $("#citation_comments_" + commentForCitation).append("<a href=javascript:; id=" + elementID + ">Hide Comments</a>");//Show the 
                    $("#citation_comments_" + commentForCitation).show();
                    
                    $(".editComments").die();
                    $("#" + elementID).die();
                    $(".editComments").die();
                    
                    
                    $("#" + elementID).click(function(){
                        $(this).parent().hide();
                        //$("#showcomment").show();
                    });
                    
                    
                    
                    var count = 1;//count to prevent multiple additions of textareas for editing comments
                    //This is the image that is shown once the user sees the comments on the right hand side
                    $(".editComments").click(function(){
                        var labelID = "label_" + $(this).parent().parent().attr("id").split("_", 2)[1];
                        alert(labelID);
                        var currentComment = $("#" + labelID).text().split(":", 2)[1];
                        $(this).parent().parent().find("#" + labelID).remove();
                        alert(currentComment);
                        $(this).after("");
                        if (1) {
                            $(this).after("<textarea id=" + labelID + "_textarea class=textarea_edit style=\" background-color: #fffff;-moz-border-radius:5px;-webkit-border-radius: 5px;border: 1px solid #000;padding: 4px;\">" + currentComment + "</textarea><br/> <br/><button id=comment_" + labelID + "_button class=comments >Add</button>");
                            count++;
                        }
                        $(".comments").die();
                        $(".comments").click(function(){
                            alert("hello");
                            var currentCommentNumber = labelID.split("_", 2)[1];
                            //alert(currentCommentNumber);
                            var editedComment = $(this).parent().find("#" + labelID + "_textarea").val();//The new comment is stored in this
                            alert(editedComment)
                            var commentEditedForCitation = elementID.split("_", 2)[1];//comment for which citation 
                            //alert(commentEditedForCitation);
                            var comment_data = {
                                "user": sakai.data.me.user.userid,
                                "comment": editedComment,
                                "Comment_for": commentEditedForCitation
                            }
                            commentsArray.splice(currentCommentNumber, 1, comment_data);
                            sakai.api.Server.removeJSON("/_user" + sakai.data.me.profile.path + "/public/commentsForCitations", function(){
                                sakai.api.Server.saveJSON("/_user" + sakai.data.me.profile.path + "/public/commentsForCitations", commentsArray, alert("data saved"));
                                //alert("data removeed");
                            });
                        });
                        
                        
                        
                    });
                    
                    //This is the inner add button after editing comments
                
                
                
                
                
                }
            });
        });
        
        
        
    }
  
  
  
  ////////////////////
  /////FETCHING//////
  //////////////////
    /**
     * Fetch the citaitons of  a user based on reference type
     * @param {Object} ref_type
     */
    function fetchCitations(ref_type){
        if (ref_type == "public") {
            sakai.api.Server.loadJSON("/_user" + sakai.data.me.profile.path + "/public/citationdata", function(success, data){
                if (success && data) {
                    parseCitations = {
                        all: data
                    };
                    $("#citation_pager").hide();
                    renderCitations("currentUser");
                }
                else {
                	$("#public_citations_view").html("Sorry no citaitons ");
                }
            });
        }
        else 
            if (ref_type == "private") {
                sakai.api.Server.loadJSON("/_user" + sakai.data.me.profile.path + "/private/citationdata", function(success, data){
                    if (success && data) {
                        parseCitations = {
                            all: data
                        };
                        $("#citation_pager").hide();
                        renderCitations("currentUser");
                    }
					else{
						$("#public_citations_view").html("Sorry no citaitons ");
					}
                });
            }
            //this is called when the user is fetching from some other user
            else 
                if (ref_type.charAt(0) == "/") {
                    //alert("hello");
                    sakai.api.Server.loadJSON("/_user" + ref_type + "/public/citationdata", function(success, data){
                        if (success) {
                            $("#errors").html("");
                            parsefetch = {
                                all: data
                            };
                            $("#citation_pager").hide();
                            renderCitations("fetch");
                        }
                        else {
                            $("#error_fetch").html("<br/><label  >Sorry" + ref_type + "has no public Citations</label>").fadeOut(5000);
                        //$("#errors").html("");
                        }
                        
                    });
                }
        
    }
   
    /**
     * 
     * @param {Object} refType refType is the tpye of reference as in private or public or its a fetch request
     */
    function getCitations(refType){
    
        pageCurrent = 0;
        if (refType == "public") {
            fetchCitations("public");
            showHideCitationManagerBookmarkInfo();
            deleteCitation();
            addAndShowComments();
            addToPrivate();
        }
        else 
            if (refType == "private") {
                fetchCitations("private");
                showHideCitationManagerBookmarkInfo();
                deleteCitation();
            //addAndShowComments();
            }
            else 
                if (refType.charAt(0) == "/") {
                    fetchCitations(refType);
                    showHideCitationManagerBookmarkInfo();
                    deleteCitation();
                    addAndShowComments();
                    addToPrivate();
                }
    }
	
	/**
	 * Parses the Response from the search 
	 * @param {Object} data The data returned from the search query
	 */
    function parseSearchResponse(data){
        parseSearch = {
            all: data
        };
        //$("#citation_pager").hide();
        renderCitations("search");
		showHideCitationManagerBookmarkInfo();
		addToPrivate();
		addAndShowComments();
        
    }
	
    /**
     * binds all the events
     */
    function clickEvents(){
    
    
        $("#add").hide();
        $("#public").die();
        $("#private").die();
        $("#import").die();
        $("#importfromconnotea").die();
        $("#search").die();
        $("#public_citations_view").hide('slow');
        
        
        
        $("#search").live("click", function(){
            $("#private").removeClass('highlited');
            $("#add_citations").removeClass('highlited');
            $("#fetchfrom").removeClass('highlited');
            $("#public").removeClass('highlited');
            $(this).addClass('highlited');
            $("#search_div").toggle('slow');
        });
        $("#public").live("click", function(){
            $("#search").removeClass('highlited');
            $("#private").removeClass('highlited');
            $("#add_citations").removeClass('highlited');
            $("#fetchfrom").removeClass('highlited');
            $(this).addClass('highlited');
            citation_public = 0;
            $("#public_citations_view").show('slow');
            refType = "public";
            //alert("hello")
            getCitations(refType);
            citation_public = 1;
            
        });
        $("#private").live("click", function(){
            $("#add_citations").removeClass('highlited');
            $("#search").removeClass('highlited');
            $("#public").removeClass('highlited');
            $("#fetchfrom").removeClass('highlited');
            $(this).addClass('highlited');
            citation_private = 0;
            $("#public_citations_view").show('slow');
            refType = "private";
            getCitations(refType);
            citation_private = 1;
        });
        $("#add_citations").live("click", function(){
            $(this).addClass('highlited');
            $("#search").removeClass('highlited');
            $("#public").removeClass('highlited');
            $("#fetchfrom").removeClass('highlited');
            $("#private").removeClass('highlited');
            $("#citations_view").toggle();
            addCitations();
        });
        
        $("#fetchfrom").live("click", function(){
            $(this).addClass('highlited');
            $("#search").removeClass('highlited');
            $("#add_citations").removeClass('highlited');
            $("#public").removeClass('highlited');
            $("#private").removeClass('highlited');
            $("#fetchfromuser").toggle('slow');
            $("#fetch").live("click", function(){
                //alert("asd");
                var userStr = $("#fetch_citations_username").val();
                var username = "/" + userStr.charAt(0) + "/" + userStr.substr(0, 2) + "/" + userStr;
                //alert("asd1");
                //alert(username);
                refType = username;
                if (userStr == "") {
                    $("#errors").html("Please Specify a username");
                }
                else {
                    getCitations(refType);
                }
                
            });
            
        });
        $("#importfromconnotea").live("click", function(){
            $("#connotea_import").toggle();
        });
        $("#export").click(function(){
            window.open("http://localhost:8080/citations.ris");
        });
        $("#import").live("click", function(){
            //alert("asd");
            $("#importForm").toggle('slow');
        });
        $("#Search").live("click", function(){
            var SearchString = "http://localhost:8080/citationsSearch?search=" + $("#searchString").val();
            alert($("#searchString").val());
            alert(SearchString);
            $.ajax({
                cache: false,
                
                url: SearchString,
                success: function(data){
                    parseSearchResponse(data);//code this function
                },
                error: function(xhr, textStatus, thrownError){
                    alert("Sorry could'nt make the required request " + sakai.data);
                },
            
            });
        });
        /**
         * THis is for temporary testing purposes
         */
        $("#remove").click(function(){
            sakai.api.Server.removeJSON("/_user" + sakai.data.me.profile.path + "/public/citationdata", function(){
                alert("data removed");
            });
            sakai.api.Server.removeJSON("/_user" + sakai.data.me.profile.path + "/private/citationdata", function(){
                alert("data removed");
            });
            
        });
    }
    /**
     * The init functon
     */
    var doInit = function(){
        clickEvents();
        //alert("hello");
    
    };
    doInit();
    
}
sakai.api.Widgets.widgetLoader.informOnLoad("citationmanager");
