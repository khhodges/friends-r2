/**
 * Signup view model
 */
var app = app || {}; // reuse the existing app or create a new, empty app container

app.Signup = (function () {
	'use strict'; //This JavaScript 1.8.5 (ECMAScript version 5) is a literal expression, 
	//ignored by earlier versions to throw silent errors, fixes mistakes and add optimizations: 
	//strict mode code may run faster and prevents syntax needed for later versions of ECMAScript.

	var singupViewModel = (function () {
		// View model components see HTML ids
		var $signUpForm;
		var $formFields;
		var $signupInfo;
		var $signupBtnWrp;

		// functional components
		var dataSource;
		var validator;		
		var avatarImage;
		var touchzone;
		var imageObj;
		var lastMove;
		var selected = "styles/images/avator.png";
		
		// Register user after required fields (username and password) are validated in Backend Services
		var signup = function () {
			dataSource.Gender = parseInt(dataSource.Gender);
			var birthDate = new Date(dataSource.BirthDate);

			if (birthDate.toJSON() === null) {
				birthDate = new Date();
			}
			//app.showAlert("addImage to " + dataSource.About);
			dataSource.BirthDate = birthDate;

			Everlive.$.Users.register(
				dataSource.Username,
				dataSource.Password,
				dataSource)
				.then(function () {
					app.showAlert("Registration successful");
					app.mobileApp.navigate('#welcome');
				},
					  function (err) {
						  app.showError(err.message);
					  });
		};	

		// Executed after Signup view initialization
		// init form validator
		var init = function () {
			// Get a reference to our touch-sensitive element
			touchzone = document.getElementById("touchzone");
			avatarImage = document.getElementById("avatarImage");
			imageObj = new Image();			
			
/*			avatarImage.addEventListener("load", function() {
				//app.showAlert(this.naturalWidth + ' ' + this.naturalHeight);
				if (this.naturalHeight > this.naturalWidth) {
					avatarImage.className = "landscape";
				}else {
					avatarImage.className = "portrate";
				}			
				app.showAlert(avatarImage.className.toString());
			})*/;
			
			// Add an event handler for the touchstart event
			lastMove = null;
			//touchzone.addEventListener('touchmove', function(event) {
			//lastMove = event;
			//}, false);
			/*			touchzone.addEventListener('touchstart', function(event) {
			lastMove = event;
			//}, false);
			//touchzone.addEventListener('touchend', function(event) {
			//alert(event.touches[0].pageX);
			var largeImage = document.getElementById('zoom_mw');
			if (largeImage.src.endsWith('avatar.png') || largeImage.src !== selected) {
			largeImage.src = selected;
			}else {
			// Write the coordinates of the touch to the div
			var H = lastMove.touches[0].target.naturalHeight;
			var W = lastMove.touches[0].target.naturalWidth;
			var X = (lastMove.touches[0].pageX) / lastMove.touches[0].target.clientWidth * W - largeImage.width/4;
			var Y = (lastMove.touches[0].pageY -$(this).offset().top) / lastMove.touches[0].target.clientHeight * H - largeImage.height/4;
			//X = (event.pageX - posX) * $scope.source.width / theImage.width;
			if (X > .8 * W)
			X = .8 * W;
			if (X < 1)
			X = 1;
			//Y = (event.pageY - posY - 50) * $scope.source.height / theImage.height;
			if (Y > .8 * H)
			Y = .8 * H;
			if (Y < 1)
			Y = 1;
			$('#Xcoords').text(X);
			$('#Ycoords').text(Y);
			cropAvatar(X, Y);
			//context.clearRect(0, 0, 200, 100);
			//context.drawImage(imageObj, 100, 100, 150, 150, 150, 150, 150, 150);
			//alert(event.touches[0].pageY);
			}
			}, false);*/
			
			//var touchHandler = ;
			
			$signUpForm = $('#signUp');
			$formFields = $signUpForm.find('input, textarea, select');
			$signupInfo = $('#signupInfo');
			$signupBtnWrp = $('#signupBtnWrp');
			validator = $signUpForm.kendoValidator({
													   validateOnBlur: false
												   }).data('kendoValidator');

			$formFields.on('keyup keypress blur change input', function () {
				if (validator.validate()) {
					$signupBtnWrp.removeClass('disabled');
				} else {
					$signupBtnWrp.addClass('disabled');
				}
			});

			$signupInfo.on('keydown', app.helper.autoSizeTextarea);
		}

		// Executed after show of the Signup view
		var show = function () {
			$signupInfo.prop('rows', 1);
			dataSource = kendo.observable({
											  Xvalue: '300',
											  Yvalue: '300',
											  Username: '',
											  Password: '',
											  DisplayName: '',				
											  Email: '',
											  Gender: '0',
											  About: 'styles/images/avatar.png',
											  Friends: [],
											  BirthDate: new Date()
										  });
			kendo.bind($('#signup-form'), dataSource, kendo.mobile.ui);
		};

		// Executed after hide of the Signup view
		// disable signup button
		var hide = function () {
			$signupBtnWrp.addClass('disabled');
		};

		var onSelectChange = function (sel) {
			var selected = sel.options[sel.selectedIndex].value;
			sel.style.color = (selected === 0) ? '#b6c5c6' : '#34495e';
		};
		
		var everlive = new Everlive("wewpzbnzheaxgay7");
		// Called when a photo is successfully retrieved
		//
		var resetImage = function() {
			var image = document.getElementById("zoom_mw");
			image.src = selected;
		}
		var pickImage = function() {
			function success(imageURI) {
				selected = imageURI;
				avatarImage.style.backgroundImage = "url(" + selected+")";
				app.mobileApp.hideLoading();
			}
			
			var error = function () {
				app.mobileApp.hideLoading();
				navigator.notification.alert("No selection was detected.");
			};
			var config = {
				destinationType: Camera.DestinationType.FILE_URI,
				quality: 50
			};
			navigator.camera.getPicture(success, error, config);
		};

		var addImage = function () {
			var success = function (data) {
				everlive.Files.create({
										  Filename: Math.random().toString(36).substring(2, 15) + ".jpg",
										  ContentType: "image/jpeg",
										  base64: data
									  })
					.then(function (promise) {
						selected = promise.result.Uri;
						var avatar = document.getElementById("avatarImage");
						avatar.src = selected;
						//image.src = selected;
						app.showAlert(avatar.naturalHeight + ", " + avatar.naturalWidth);
						if (avatar.naturalHeight > avatar.naturalWidth) {
							avatar.style.height = "100%";
							avatar.style.width = "auto";
						}else {
							avatar.style.height = "auto";
							avatar.style.width = "100%";
						}
						app.mobileApp.hideLoading();
					})
			};
			var error = function () {
				app.mobileApp.hideLoading();
				navigator.notification.alert("Unfortunately we could not add the image");
			};
			var config = {
				destinationType: Camera.DestinationType.DATA_URL,
				quality: 50
			};
			app.mobileApp.showLoading();
			navigator.camera.getPicture(success, error, config);
		};

		var loadPhotos = function (promise) {
			dataSource.About = promise.result.Uri;
			//app.showAlert("addImage to " + dataSource.About);
			var files = [];
			if (promise.result.Uri === "") {
				everlive.Files.get().then(function (data) {
					for (var i = data.result.length - 1; i >= 0; i--) {
						var image = data.result[i];
						files.push(image.Uri);
						$("#images").kendoMobileListView({
															 dataSource: files,
															 template: "<ui><div class='adiv' ><img class='crop' src='#: data #' /></ui>"
														 });
					}
				})
			} else {
				var largeImage = document.getElementById('largeImage');
				largeImage.style.display = 'block';
				largeImage.src = promise.result.Uri;
			}
			app.mobileApp.hideLoading();
		};

		var cropAvatar = function(X, Y) {
			var source = new Image();
			var d = document.getElementById("zoom_mw");
			source.src = d.src;
			var canvas = document.getElementById("myCanvas");
			var avatar = document.getElementById("myCanvas");
			var context = canvas.getContext("2d");
			canvas.width = source.width;
			canvas.height = source.height;
			if (source.height > source.width) {
				context.drawImage(source, X, Y, source.height / 2, source.height / 2, 0, 0, source.height, source.height);
				avatar.style.height = source.height / 2;
			} else {
				context.drawImage(source, X, Y, source.width / 2, source.width / 2, 0, 0, source.width, source.width);
				avatar.style.width = source.width / 2;
			}
			var size = 200;
			var scale = 10;
			context.font = size + "px impact";
			var lineOfText = "Kenneth Hamer-Hodges";

			while (context.measureText(lineOfText).width / canvas.offsetWidth > 1) {
				size = size - scale;
				context.font = size + "px impact";
				if (size < 30)
					scale = 2;
			}
			context.textAlign = 'center';
			context.fillStyle = 'yellow';

			context.fillText(lineOfText, canvas.width / 2, canvas.height * 0.6);

			var imgURI = canvas.toDataURL();

			setTimeout(function() {
				var imageA = document.getElementById("avatarImage");
				imageA.src = imgURI;
				if (imageA.style.height > imageA.style.width) {
					imageA.style.height = "100%";
					imageA.style.width = "auto";
				}else {
					imageA.style.height = "auto";
					imageA.style.width = "100%";
				}
				canvas.style.visibility = 'hidden';
			}, 200);
		}
		return {
			init: init,
			show: show,
			hide: hide,
			onSelectChange: onSelectChange,
			signup: signup,
			addImage: addImage,
			pickImage: pickImage,
			resetImage: resetImage
		};
	}()
	);

	return singupViewModel;
}());