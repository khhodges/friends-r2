var app = (function () {
	'use strict';

	// global error handling
	var showAlert = function(message, title, callback) {
		navigator.notification.alert(message, callback || function () {
		}, title, 'OK');
	};
	var showError = function(message) {
		showAlert(message, 'Error occured');
	};
	window.addEventListener('error', function (e) {
		e.preventDefault();
		var message = e.message + "' from " + e.filename + ":" + e.lineno;
		showAlert(message, 'Error occured');
		return true;
	});

	var onBackKeyDown = function(e) {
		e.preventDefault();
		navigator.notification.confirm('Do you really want to exit?', function (confirmed) {
			var exit = function () {
				navigator.app.exitApp();
			};
			if (confirmed === true || confirmed === 1) {
				AppHelper.logout().then(exit, exit);
			}
		}, 'Exit', 'Ok,Cancel');
	};
	var onDeviceReady = function() {
		//Handle document events
		document.addEventListener("backbutton", onBackKeyDown, false);
	};
	document.addEventListener("backbutton", onBackKeyDown, false);
	// document.addEventListener("deviceready", onDeviceReady, false);

	// initialize Everlive SDK
	var el = new Everlive({
							  apiKey: "zaxw8h0stlogznox"
						  });
    
	var mimeMap = {
		jpg  : "image/jpeg",
		jpeg : "image/jpeg",
		png  : "image/png",
		gif  : "image/gif"
	};

	var AppHelper = {
		resolveImageUrl: function (id) {
			if (id) {
				return el.Files.getDownloadUrl(id);
			} else {
				return '';
			}
		},
		getBase64ImageFromInput : function (input, cb) {
			var reader = new FileReader();
			reader.onloadend = function (e) {
				if (cb)
					cb(e.target.result);
			};
			reader.readAsDataURL(input);
		},
		getImageFileObject: function(input, cb) {
			var name = input.name;
			var ext = name.substr(name.lastIndexOf('.') + 1);
			var mimeType = mimeMap[ext];
			if (mimeType) {
				this.getBase64ImageFromInput(input, function(base64) {
					var res = {
						"Filename"    : name,
						"ContentType" : mimeType,              
						"base64"      : base64.substr(base64.lastIndexOf('base64,') + 7)
					}
					cb(null, res);
				});
			} else {
				cb("File type not supported: " + ext);    
			}
		}
	};

	var mobileApp = new kendo.mobile.Application(document.body, { transition: 'slide', layout: 'mobile-tabstrip' });
    
	var imagesViewModel = (function () {
		var imagesModel = {
			id: 'Id',
			fields: {
				Title: {
						field: 'Title',
						defaultValue: ''
					},
				Picture: {
						fields: 'Picture',
						defaultValue: ''
					}
			},
			PictureUrl: function () {
				return AppHelper.resolveImageUrl(this.get('Picture'));
			}
		};
		var imagesDataSource = new kendo.data.DataSource({
															 type: 'everlive',
															 schema: {
				model: imagesModel
			},
															 transport: {
				typeName: 'Files'
			},
															 change: function (e) {
																 if (e.items && e.items.length > 0) {
																	 $('#no-images-span').hide();
																 } else {
																	 $('#no-images-span').show();
																 }
															 },
															 sort: { field: 'Title', dir: 'asc' }
														 });
		return {
			images: imagesDataSource
		};
	}());
    
	// **************************************************
	//           new view model for add picture
	// **************************************************
	var $newPicture;
  
	var observable = {
		picName: '',
		picTitle: '',
		picSelected: false,
		onPicSet: function(e) {
			this.set('picSelected', true);
			this.set('picName', e.target.files[0].name);
		},
		onRemovePic: function() {
			this.set("picSelected", false);
			// reset the file upload selector
			$newPicture = $newPicture || $("#newPicture");
			$newPicture.replaceWith($newPicture = $newPicture.clone(true));
		},
		onAddPic: function() {
			$newPicture = $newPicture || $("#newPicture");
			$newPicture.click();
		},
		saveItem: function() {
			var that = this;
			$newPicture = $newPicture || $("#newPicture");
			AppHelper.getImageFileObject(
				$newPicture[0].files[0],
				function(err, fileObj) {
					if (err) {
						navigator.notification.alert(err);    
						return;
					}
					$.ajax({
							   type: "POST",
							   url: 'http://api.everlive.com/v1/zaxw8h0stlogznox/Files',
							   contentType: "application/json",
							   data: JSON.stringify(fileObj),
							   error: function(error) {
								   navigator.notification.alert(JSON.stringify(error));
							   }
						   }).done(function(data) {
							   var item = imagesViewModel.images.add();
							   item.Title = that.get('picTitle');
							   item.Picture = data.Result.Id;
							   imagesViewModel.images.one('sync', function () {
								   mobileApp.navigate('#:back');
							   });
							   imagesViewModel.images.sync();
                        
							   // reset the form
							   that.set("picSelected", false);
							   $newPicture.replaceWith($newPicture = $newPicture.clone(true));
						   });
				}
				);          
		}
	};
	// ***************** END ****************************

	// add image view model
	var addImageViewModel = (function () {
		var picName = "";
		var $newTitle;
		var $newPicture;
		var $picName;
		var $picInfo;
		var $newPicLabel;
		var validator;
		var init = function () {
			validator = $('#enterItem').kendoValidator().data("kendoValidator");
			$newTitle = $('#newTitle');
			$picName = $('#picName');
			$newPicture = $('#newPicture');    
			$newPicLabel = $('#newPicLabel');
			$picInfo = $("#picInfo");
		};
		var show = function () {
			$newTitle.val('');
			$newPicture.val('').show();
			$newPicLabel.show();
			$picInfo.hide();
			validator.hideMessages();
		};
		var saveItem = function () {
			if (validator.validate()) {
				AppHelper.getImageFileObject(
					$newPicture[0].files[0],
					function(err, fileObj) {
						if (err) {
							navigator.notification.alert(err);    
							return;
						}
						$.ajax({
								   type: "POST",
								   url: 'http://api.everlive.com/v1/zaxw8h0stlogznox/Files',
								   contentType: "application/json",
								   data: JSON.stringify(fileObj),
								   error: function(error) {
									   navigator.notification.alert(JSON.stringify(error));
								   }
							   }).done(function(data) {
								   var item = imagesViewModel.images.add();
								   item.Title = $newTitle.val();
								   item.Picture = data.Result.Id;
								   imagesViewModel.images.one('sync', function () {
									   mobileApp.navigate('#:back');
								   });
								   imagesViewModel.images.sync();
								   picSelected = false;
							   });
					}
					);                
			}
		};
		var onPicSet = function(e) {
			$picName.text($newPicture[0].files[0].name);
			observable.set("picSelected", true);
			$newPicture.hide();
			$newPicLabel.hide();
		};
		var removePic = function() {
			$picName.text("");
			$picInfo.hide();
			$newPicture.val('').show();
			$newPicLabel.show();
		};
		return {
			init: init,
			show: show,
			saveItem: saveItem,
			onPicSet: onPicSet,
			removePic : removePic
		};
	}());

	return {
		viewModels: {
			images: imagesViewModel,
			addImage : observable
		}
	};
}());