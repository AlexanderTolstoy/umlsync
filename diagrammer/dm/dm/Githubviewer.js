/*
Class: GithubView

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2012 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  umlsync.org/about

Version:
  2.0.0 (2012-07-22)
 */
//@aspect
(function($, dm, undefined) {
    


    dm.base.GithubView = function(url, token) {

        function treeView(data, textStatus, jqXHR, readmeLoader) {
              //the variable 'data' will have the JSON object
              // In your example, the following will work:
                if (data['data']) {
                  var ret = [];
                  var json = data['data'];
				  var LoadReadMe = null;
                  for (j in json["tree"]) {
                    ret[j] = {};
                    if (json["tree"][j]["type"] == "blob") {
                        ret[j]["isFolder"] = false;
                        ret[j]["isLazy"] = false;
                        ret[j]["title"] = json["tree"][j]["path"];
                        ret[j]["sha"] = json["tree"][j]["sha"];
                    } else if (json["tree"][j]["type"] == "tree") {
                        ret[j]["isFolder"] = true;
                        ret[j]["isLazy"] = true;
                        ret[j]["title"] = json["tree"][j]["path"];
                        ret[j]["sha"] = json["tree"][j]["sha"];
                    }
					if (json["tree"][j]["path"].indexOf("README") == 0) {
						LoadReadMe = json["tree"][j]["sha"];
					}
                  }
				  if (LoadReadMe) {
					readmeLoader(LoadReadMe);
				  }
                  return ret;
                }
              return data;
        };


		function decodeMDContent(data, textStatus, jqXHR, callback) {

          for (d in data) {
            if (d == 'data') {
               var splitted = data[d].content.split('\n');
               var decoded = "";
               for (s in splitted) {
                 decoded += $.base64.decode(splitted[s]);
               }
			   
			   if (callback) {
			     callback(decoded);
			   }
			   
			   return;
			}
          }
        };

        function decodeContent(data, textStatus, jqXHR, callback) {
          for (d in data) {
            if (d == 'data') {
               var splitted = data[d].content.split('\n');
               var decoded = "";
               for (s in splitted) {
                 decoded += $.base64.decode(splitted[s]);
               }
               var json = $.parseJSON(decoded);
			   if (callback) callback(json);
            }
          }
        };

		function decodeContent2(data, textStatus, jqXHR, callback) {
          for (d in data) {
            if (d == 'data') {
               var splitted = data[d].content.split('\n');
               var decoded = "";
               for (s in splitted) {
                 decoded += $.base64.decode(splitted[s]);
               }

			   if (callback) callback(decoded);
            }
          }
        };

        var pUrl = url;
        var self = {
		    euid: "Github",
            // Check if loging required
            init: function() {
			  $.ajax({
				url: 'https://api.github.com/legacy/repos/search/:diagrams',
                  dataType: 'jsonp',
                  success: function(mdata) {
                       var data = mdata.data;
	
				      //var IGhView = new dm.base.GithubView("https://api.github.com/repos/umlsynco/diagrams", "{{ access_token }}");
					 // if (data["repositories"])
			         //  dm.dm.fw.addRepositories(self.euid, 'search',data["repositories"]);
					   
					 var userRepo = [
      {
        "type": "repo",
        "created_at": "2012-06-19T08:24:46-07:00",
        "watchers": 1,
        "username": "umlsynco",
        "owner": "umlsynco",
        "pushed_at": "2012-11-02T13:49:57-07:00",
        "forks": 0,
        "description": "Repository for diagram managment.",
        "fork": false,
        "size": 388,
        "language": null,
        "pushed": "2012-11-02T13:49:57-07:00",
        "name": "diagrams",
        "private": false,
        "created": "2012-06-19T08:24:46-07:00",
        "followers": 1
      }
    ];
	
	dm.dm.fw.addRepositories(self.euid, 'user', userRepo);
					   
					   dm.dm.fw.addSearchResults(self.euid, 'diagrams',data["repositories"]);

					  //dm.dm.fw.addView2("umlsynco/umlsync", IGhView);
  			    }
			  });
            },
			Search: function(name) {
			  $.ajax({
				url: 'https://api.github.com/legacy/repos/search/:' + name,
                  dataType: 'jsonp',
                  success: function(mdata) {
                       var data = mdata.data;
					   dm.dm.fw.addSearchResults(self.euid, name, data["repositories"]);
  			    }
			  });
			},
            info: function(callback) {
                // TODO: define github view capabilities
                //       right now only view available
                if (callback)
                    callback(null);
            },
		    'save': function(path, data, description) {
			var content = data;
			/*alert("SAVE:" + data);
			//if (typeof(content) === "string") {
content = {
"content": content,
"encoding": "utf-8"
};
//} 
			_request("POST", pUrl + "/git/blobs", content, function(err, res) {
			    if (err) { alert("ERR:" + err);} else 
			    alert("SHA:" + res.sha);
			}); 
			*/
  /*            $.ajax({"url":"https://api.github.com/repos/EvgenyAlexeyev/umlsync/git/blobs?access_token=" + token,
		      "type":"post",
		      "data":{"content" : data,
			      "encoding": "utf-8"},
		      "success":function(response) {
			  $.RRRRRRRRRRTTTTTTTTTTTTT = reponse;
			  alert(response);
			  alert(response.sha);
			  alert(response.url);
		       },
		       "error" : function() { 
			   alert("FAILED to create blob 1");},
		      });*/
		    },
			'loadDiagram': function(node, repo, callback) {
			  if (node && node.data && node.data.sha) {
		        $.ajax({
		          url: 'https://api.github.com/repos/'+repo+'/git/blobs/'+node.data.sha,
                  accepts: 'application/vnd.github-blob.raw',
			      dataType: 'jsonp',
                  success: function(x, y, z) {decodeContent(x,y,z,callback.success);},
			      error:callback.error
		        });
			  }
			},
			'loadCode': function(node, repo, callback) {
			  if (node && node.data && node.data.sha) {
		        $.ajax({
		          url: 'https://api.github.com/repos/'+repo+'/git/blobs/'+node.data.sha,
                  accepts: 'application/vnd.github-blob.raw',
			      dataType: 'jsonp',
                  success: function(x, y, z) {decodeContent2(x,y,z,callback.success);},
			      error:callback.error
		        });
			  }
			},
			'loadMarkdown': function(node, repo, callback) {
			  if (node && node.data && node.data.sha) {
		        $.ajax({
		          url: 'https://api.github.com/repos/'+repo+'/git/blobs/'+node.data.sha,
                  accepts: 'application/vnd.github-blob.raw',
			      dataType: 'jsonp',
                  success: function(x, y, z) {decodeMDContent(x,y,z,callback.success);},
			      error:callback.error
		        });
			  }
			},
			'ctx_menu': [
				{
					title:"Reload",
					click: function(node) {
						node.reloadChildren();
					}
				},
				{
					title:"Open",
					click: function(node) {
					// TODO: REMOVE THIS COPY_PAST OF tree.onActivate !!!
					  if ((!node.data.isFolder)
                        && (node.data.title.indexOf(".json") != -1)) {
						dm.dm.fw.loadDiagram(self.euid, node);
                    /*$.ajax({
                        accepts: 'application/vnd.github-blob.raw',
                        dataType: 'jsonp',
                        url: 'https://api.github.com/repos/EvgenyAlexeyev/umlsync/git/blobs/'+node.data.sha,
                        success: decodeContent,
                        error: function(jqXHR, textStatus, errorThrown) {
                           //Error handling code
                           alert('Oops there was an error');
                        },
                    });*/
				      }
					} // click
			   },
			   {
					title: "Save",
					click:function(node) {
					},
				},
				{
					title:"New folder",
					click: function(node) {
						this.newfolder(node.getAbsolutePath(), "newFolder", function(desc) {node.addChild(desc);});
					}
				},
			   {
					title:"Remove",
					click: function(node) {
						this.remove(node.getAbsolutePath(), function() {node.remove();});
					}
				}
			],
            tree: function(repo) {
			  var pUrl = "https://api.github.com/repos/"  + repo;
			  function extractReadMe(LoadReadMe) {
				  dm.dm.fw.loadMarkdown(self.euid, repo, {data:{sha:LoadReadMe}});
			  }
			  function postProcessTreeView(data, textStatus, jqXHR) {
			    return treeView(data, textStatus, jqXHR, extractReadMe);				
			  }

			  return {
                persist: true,
                initAjax: {
                    url: pUrl + '/git/trees/master',
                    dataType:"jsonp",
                    postProcess: postProcessTreeView
                },
                onCreate: function(node, span){
                   $(span).bind('contextmenu', function(e) {
				     var node = $.ui.dynatree.getNode(e.currentTarget);
					 dm.dm.fw.ShowContextMenu("Github", e, node);
					 e.preventDefault();
				   });
                },
                onLazyRead: function(node){
                    if (node.data.isFolder)
                        node.appendAjax({url: pUrl + "/git/trees/" + node.data.sha,
                               postProcess: postProcessTreeView,
                               dataType:"jsonp"});
                },
                onActivate: function(node) {
                    if (!node.data.isFolder) {
					    var tt = node.data.title.split(".");
						var title = tt[0].toUpperCase(), ext = (tt.length > 1) ? tt[tt.length-1].toUpperCase() : "";
						    
                        if (ext == "JSON" || ext == "UMLSYNC") {
						  dm.dm.fw.loadDiagram(self.euid, repo, node);
						} else if (title == "README" ||  ext == "MD" || ext == "rdoc") {
						  dm.dm.fw.loadMarkdown(self.euid, repo, node);
						} else if ((["C", "CPP", "H", "HPP", "PY", "HS", "JS", "CSS", "JAVA", "RB", "PL", "PHP"]).indexOf(ext) > 0){
						  dm.dm.fw.loadCode(self.euid, repo, node);
						}
				    }
                }
			  }
            },
        };
		return self;
    };
//@aspect
})(jQuery, dm);
