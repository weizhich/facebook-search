        //load fb sdk  
        window.fbAsyncInit = function() {
            FB.init({
              appId      : '257584944687519',
              xfbml      : true,
              version    : 'v2.8'
            });
            FB.AppEvents.logPageView();
          };

          (function(d, s, id){
             var js, fjs = d.getElementsByTagName(s)[0];
             if (d.getElementById(id)) {return;}
             js = d.createElement(s); js.id = id;
             js.src = "//connect.facebook.net/en_US/sdk.js";
             fjs.parentNode.insertBefore(js, fjs);
           }(document, 'script', 'facebook-jssdk'));
            //init variables
            var data = "";
            var aList = "";
            var pList = "";
            var tag = "Users";
            var crd = "";
            var show = "";
            var splitStr = '!#$%^*';
            var previousURL = "";
            var nextURL = "";
            var tempId = [];
            var tempName = [];
            var tempPic = [];
            // Declare the main module
            var app = angular.module('myApp', ['ngAnimate']);        
            app.controller('myController', function($scope) {
                $scope.checkPage1 = true;
                $scope.checkPage2 = false;
            });
            function success(pos){
                crd = pos.coords; 
            }
            function error(err) {
              console.warn(`ERROR(${err.code}): ${err.message}`);
            };
            function load(){
                var options = {
                  enableHighAccuracy: false,
                  timeout: 5000,
                  maximumAge: 0
                };
                navigator.geolocation.getCurrentPosition(success, error, options);
            }
            function searchJSON(){
                if ($("#searchInput")[0].value == ''){
                    $('#searchInput').tooltip('toggle');
                    return;
                }
                if (tag != 'Favorites')
                    document.getElementById('testdiv').innerHTML = "";
                var myurl = "http://sample-env-1.zhxcb8ruey.us-east-1.elasticbeanstalk.com/";
                var appElement = document.querySelector('[ng-controller=myController]');
                var $scope = angular.element(appElement).scope();
                if ($scope.checkPage1 == false){
                    $scope.checkPage1 = true;
                    $scope.checkPage2 = false;
                    $scope.$apply();
                }
                $.ajax({  
                    url:myurl,  
                    dataType:'jsonp',  
                    data:{"value":$("#searchInput")[0].value, "latitude":crd.latitude, "longitude":crd.longitude},  
                    jsonp:'callback',  
                    type:'GET',
                    beforeSend:function(XMLHttpRequest){
                          $("#proMain")[0].style.display = "block";
                    },
                    success:function(result) {  
                        $("#proMain")[0].style.display = "none";
                        data = result;
                        showPage();
                    }
                }); 
            }
            function change(x){
                tag = x.innerHTML;
                showPage();
                var appElement = document.querySelector('[ng-controller=myController]');
                var $scope = angular.element(appElement).scope();
                if ($scope.checkPage1 == false){
                    $scope.checkPage1 = true;
                    $scope.checkPage2 = false;
                    $scope.$apply();
                }
            }
            function showPage(){
                if (tag == 'Users')
                    show = data['user'];
                else if (tag == 'Pages')
                    show = data['page'];
                else if (tag == 'Events')
                    show = data['event'];
                else if (tag == 'Places')
                    show = data['place'];
                else if (tag == 'Groups')
                    show = data['group'];
                else 
                    show = "Favorites is coming!!!";
                tempId = [];
                tempPic = [];
                tempName = [];
                if (tag != 'Favorites')
                    drawTable();
                else if (tag == 'Favorites')
                    drawFavorites();
                
            }
            function drawTable(){
                document.getElementById("testdiv").innerHTML = "";
                if (data == '')
                    return;
                if (show['data'].length == 0)
                    html_text = "<table class='table table-hover'><thead><tr><th>No Records has been found</th></tr></thead></table>";
                else{
                    html_text = "<div class='table-responsive'>";
                    html_text += "<table class='table table-hover' id='mainTab'>";
                    html_text += "<thead><tr>";
                    html_text += "<th>#</th>";
                    html_text += "<th>Profile Photo</th>";
                    html_text += "<th>Name</th>";
                    html_text += "<th>Favorite</th>";
                    html_text += "<th>Details</th></tr></thead>";
                    //add the content in the table
                    html_text += "<tbody>";
                    var innerdata = show['data'];
                    for(var i = 0; i < innerdata.length; i++){
                        tempId[i] = innerdata[i]['id'];
                        tempPic[i] = innerdata[i]['picture']['data']['url'];
                        tempName[i] = innerdata[i]['name'];
                        html_text += "<tr><td><h5><strong>" + (i+1) + "</strong></h5></td>";
                        html_text += "<td><a href='" + innerdata[i]['picture']['data']['url'] + "'target=_blank><img src='" 
                                     + innerdata[i]['picture']['data']['url'] + "' class='img-circle'/></a></td>";
                        html_text += "<td>" + innerdata[i]['name'] + "</td>";
                        if(localStorage.getItem(innerdata[i]['id']) != null){
                            html_text += "<td><button type='button' class='btn btn-default' id='favorite" + i + "' onclick='favorite(" + i + ")' style='border-radius:6px !important;'>";
                            html_text += "<span class='glyphicon glyphicon-star' aria-hidden='true'></span>";
                        }else{
                            html_text += "<td><button type='button' class='btn btn-default' id='favorite" + i + "' onclick='favorite(" + i + ")' style='border-radius:6px !important;'>";
                            html_text += "<span class='glyphicon glyphicon-star-empty' aria-hidden='true'></span>";
                        }
                        html_text += "</button></td>"
                        html_text += "<td><button type='button' class='btn btn-default' id='detail" + i + "' onclick='getDetail(" + i + ")' style='border-radius:6px !important;'>";
                        html_text += "<span class='glyphicon glyphicon-chevron-right' aria-hidden='true'></span>";
                        html_text += "</button></td>";
                        html_text += "</tr>";
                    }
                    html_text += "</tbody></table></div>";
                    //add previous and next button
                    var paging = show['paging'];
                    if(('paging' in show) && ('next' in paging) && ('previous' in paging)){
                        previousURL = paging['previous'];
                        nextURL = paging['next'];
                        html_text += "<p style='margin:0 auto; text-align:center;'><button type='button' class='btn btn-default' id='previousBtn' onclick='changePage(1)'>Previous</button><button type='button' class='btn btn-default' id='nextBtn' onclick='changePage(2)'>Next</button></p>";
                    }else if(('paging' in show) && ('next' in paging)){
                        previousURL = "";
                        nextURL = paging['next'];
                        html_text += "<p style='margin:0 auto; text-align:center;'><button type='button' class='btn btn-default' id='nextBtn' onclick='changePage(2)'>Next</button></p>";
                    }else if(('paging' in show) && ('previous' in paging)){
                        previousURL = paging['previous'];
                        nextURL = "";
                        html_text += "<p style='margin:0 auto; text-align:center;'><button type='button' class='btn btn-default' id='previousBtn' onclick='changePage(1)'>Previous</button></p>";
                    }
                
                }
                document.getElementById("testdiv").innerHTML = html_text;
               // document.getElementById('testdiv').innerHTML = "<h3>" + tag +"</h3><br>" + JSON.stringify(show);
            }
            function changePage(id){
                url = (id == 1)? previousURL : nextURL;
                $.getJSON(url, function(page){
                    show = page;
                if (tag == 'Users')
                    data['user'] = page;
                else if (tag == 'Pages')
                    data['page'] = page;
                else if (tag == 'Events')
                    data['event'] = page;
                else if (tag == 'Places')
                    data['place'] = page;
                else if (tag == 'Groups')
                    data['group'] = page;
                    tempId = [];
                    tempName = [];
                    tempPic = [];
                    drawTable();
                });
            }
            function favorite(num){
                //it is not a favorite yet
                if (localStorage.getItem(tempId[num]) == null){
                    var x = document.getElementById("favorite" + num);
                    x.innerHTML = "<span class='glyphicon glyphicon-star' aria-hidden='true'></span>";
                    var storeStr = tempName[num] + splitStr + tempPic[num] + splitStr + tag;
                    localStorage.setItem(tempId[num], storeStr);
                }else{
                    var x = document.getElementById("favorite" + num);
                    x.innerHTML = "<span class='glyphicon glyphicon-star-empty' aria-hidden='true'></span>";
                    localStorage.removeItem(tempId[num]);
                }
            }
            function drawFavorites(){
                document.getElementById("testdiv").innerHTML = "";
                if (localStorage.length == 0){
                    html_text = "<table class='table table-hover'><thead><tr><th>No Favorites Record Saved Yet!</th></tr></thead></table>";
                }else{
                    html_text = "<div class='table-responsive'>";
                    html_text += "<table class='table table-hover' id='mainTab'>";
                    html_text += "<thead><tr>";
                    html_text += "<th>#</th>";
                    html_text += "<th>Profile Photo</th>";
                    html_text += "<th>Name</th>";
                    html_text += "<th>Type</th>";
                    html_text += "<th>Favorite</th>";
                    html_text += "<th>Details</th></tr></thead>"
                    //add the content in the table
                    html_text += "<tbody>";
                    for (var i = 0; i < localStorage.length; i++){
                        var thisKey = localStorage.key(i);
                        var thisArray = localStorage.getItem(thisKey).split(splitStr);
                        html_text += "<tr><td><h5><strong>" + (i+1) + "</strong></h5></td>";
                        html_text += "<td><a href='" + thisArray[1] + "'target=_blank><img src='" 
                                     + thisArray[1] + "' class='img-circle'/></a></td>";
                        html_text += "<td>" + thisArray[0] + "</td>";
                        html_text += "<td>" + thisArray[2].toLowerCase() + "</td>";
                        html_text += "<td><button type='button' class='btn btn-default' id='delete" + i + "' onclick='deleteFavorite(" + i + ")' style='border-radius:6px !important;'>";
                        html_text += "<span class='glyphicon glyphicon-trash' aria-hidden='true'></span>";
                        html_text += "</button></td>";
                        html_text += "<td><button type='button' class='btn btn-default' id='detail" + i + "' onclick='getDetail(" + i + ")' style='border-radius:6px !important;'>";
                        html_text += "<span class='glyphicon glyphicon-chevron-right' aria-hidden='true'></span>";
                        html_text += "</button></td>";
                    }
                    html_text += "</tbody></table></div>";
                }
                document.getElementById("testdiv").innerHTML = html_text;
            }
            function deleteFavorite(num){
                var thisKey = localStorage.key(num);
                localStorage.removeItem(thisKey);
                drawFavorites();
            }
            function getDetail(num){
                document.getElementById('testdiv2').style.visibility = 'visible';
                searchDetail(num);
                //switch to page2
                var appElement = document.querySelector('[ng-controller=myController]');
                var $scope = angular.element(appElement).scope();
                $scope.checkPage1 = false;
                $scope.checkPage2 = true;
                $scope.$apply();
            }
            function searchDetail(num){
                var detailId = (tag == 'Favorites') ? localStorage.key(num) : tempId[num];
                var searchTag = (tag == 'Favorites') ? localStorage.getItem(detailId).split(splitStr)[2] : tag;
                document.getElementById('albumsList').innerHTML = '';
                document.getElementById('postsList').innerHTML = '';
                document.getElementById('detailFav').style.visibility = 'hidden';
                document.getElementById('detailFB').style.visibility = 'hidden';
                var myurl = "http://sample-env-1.zhxcb8ruey.us-east-1.elasticbeanstalk.com/";
                $.ajax({  
                    url:myurl,  
                    dataType:'jsonp',  
                    data:{"id":detailId, "type":searchTag},  
                    jsonp:'callback',  
                    type:'GET',
                    beforeSend:function(XMLHttpRequest){
                          $("#proAlbums")[0].style.display = "block";
                          $("#proPosts")[0].style.display = "block";
                    },
                    success:function(result) {  
                        $("#proAlbums")[0].style.display = "none";
                        $("#proPosts")[0].style.display = "none";
                        var x = document.getElementById('detailFav');
                        var tempTag = "";
                        if (localStorage.getItem(detailId) != null){
                            x.innerHTML = "<span class='glyphicon glyphicon-star' aria-hidden='true'></span>";
                            tempTag = localStorage.getItem(detailId).split(splitStr)[2].toLowerCase();
                        }
                        else{
                            x.innerHTML = "<span class='glyphicon glyphicon-star-empty' aria-hidden='true'></span>";
                            tempTag = tag;
                        }
                        x.style.visibility = 'visible';
                        x.onclick = function(){
                            var y = document.getElementById('detailFav');
                            if (localStorage.getItem(detailId) == null){
                                y.innerHTML = "<span class='glyphicon glyphicon-star' aria-hidden='true'></span>";
                                var storeStr = result['name'] + splitStr + result['picture']['data']['url'] + splitStr + tempTag;
                                localStorage.setItem(detailId, storeStr);
                            }else{
                                y.innerHTML = "<span class='glyphicon glyphicon-star-empty' aria-hidden='true'></span>";
                                localStorage.removeItem(detailId);
                            }
                        }
                        var x = document.getElementById('detailFB');
                        x.style.visibility = 'visible';
                        x.onclick = function(){
                            FB.ui({
                                 app_id: '257584944687519',
                                 method: 'feed',
                                 link: window.location.href,
                                 picture: result['picture']['data']['url'],
                                 name: result['name'],
                                 caption: 'FB SEARCH FROM USC CSCI571',
                                 }, function(response){
                                 if (response && !response.error_message)
                                    alert('Posted Successfully');
                                 else
                                    alert('Not Posted');
                            });
                        }
                        
                        if ('albums' in result)
                            aList = result['albums'];
                        else
                            aList = null;
                        if ('posts' in result)
                            pList = result['posts'];
                        else
                            pList = null;
                        showAlbums();
                        showPosts(result['name'], result['picture']['data']['url']);
                    }
                }); 
            }
            function showAlbums(){
                if ((aList == null)||(aList['data'].length == 0))
                    html_text = "<p id = 'noData'>No data found.</p>";
                else{
                    var list = aList['data'];
                    var html_text = '';
                    html_text = "<div class='panel-group' id='albumsPanel'>";
                    for (var i = 0; i < list.length; i++){
                        html_text += "<div class='panel panel-default'>";
                        html_text += "<div class='panel-heading'><div class='panel-title'>";
                        if ('photos' in list[i]){
                            html_text += "<a data-toggle='collapse' data-parent='#albumsPanel' href='#albums" + i + "'>" + list[i]['name'] + "</a>";
                        }else
                            html_text += list[i]['name'];
                        html_text += "</div></div>";
                        if ('photos' in list[i]){
                            if (i == 0)
                                html_text += "<div id='albums" + i + "' class='panel-collapse collapse in'><div class='panel-body'>";
                            else
                                html_text += "<div id='albums" + i + "' class='panel-collapse collapse'><div class='panel-body'>";
                            var photos = list[i]['photos']['data'];
                            for (var j = 0; j < photos.length; j++){
                                var tempKey = "photo#" + i + "#" + j;
                                html_text += "<a href='" + aList[tempKey] + "'target=_blank><img src='" + aList[tempKey] + "' style='margin: 10px 0;border-radius: 10px !important;width:100%;height:100%;'/></a><br/>";
                            }
                            html_text += "</div></div>";
                        }
                        html_text += "</div>";
                    }
                    html_text += "</div>";
                }
                document.getElementById('albumsList').innerHTML = html_text;
            }
            function showPosts(name, url){
                var flag = true;
                if ((pList == null)||(pList['data'].length == 0))
                    html_text = "<p id = 'noData'>No data found.</p>";
                else{
                    var list = pList['data'];
                    html_text = "<div class='panel-group' id='postsPanel'>";
                    for (var i = 0; i < list.length; i++){
                        if ('message' in list[i]){
                            flag = false;
                            html_text += "<div class='panel panel-default'><div class='panel-body'>";
                            html_text += "<div class='pHead'>";
                            html_text += "<a href='" + url + "'target=_blank><img src='" 
                                     + url + "'style='width:50px; display: block; position: absolute;'/></a>";
                            html_text += "<div class='pContent'>"
                            html_text += "<strong>" + name + "</strong><br/>";
                            html_text += "<p class='dateP'>" + moment(list[i]['created_time']).format('YYYY-MM-DD h:mm:ss') + "</p>";
                            html_text += "</div></div>";
                            html_text += "<div class='pText'>" + list[i]['message'] + "</div>";
                            html_text += "</div></div>";
                        }
                    }
                    html_text += "</div>";
                    if (flag)
                        html_text = "<p id = 'noData'>No post found in data.</p>";
                }
                document.getElementById('postsList').innerHTML = html_text;
            }
            function backPage1(){
                if (tag != 'Favorites')
                    drawTable();
                else if (tag == 'Favorites')
                    drawFavorites();
                var appElement = document.querySelector('[ng-controller=myController]');
                var $scope = angular.element(appElement).scope();
                $scope.checkPage1 = true;
                $scope.checkPage2 = false;
                $scope.$apply();
            }
            function clearField(){
                if (tag != 'Favorites')
                    document.getElementById("testdiv").innerHTML = "";
                data = '';
                $('#usera').trigger('click');
                var appElement = document.querySelector('[ng-controller=myController]');
                var $scope = angular.element(appElement).scope();
                $scope.checkPage1 = true;
                $scope.checkPage2 = false;
                $scope.$apply();
            }
            function destroyTool(){
                $('#searchInput').tooltip('destroy');
            }