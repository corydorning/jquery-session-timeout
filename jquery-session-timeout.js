/*! jquery-session-timeout.js
 *
 * Authored by: Cory Dorning
 * Website: http://corydorning.com/projects/jquery-session-timeout
 * Source: https://github.com/corydorning/jquery-session-timeout
 *
 * Dependencies: jQuery v1.10+, jQuery UI 1.10+
 *
 * Last modified by: Cory Dorning
 * Last modified on: 11/19/2013
 *
 * The jQuery Session Timeout plugin provides the end-user with a modal
 * dialog when their session is about to expire and allows them to logout
 * or keep their session alive.
 *
 */

// include semicolon to make sure any JS before this plugin is terminated
;(function($) {
  // ECMAScript 5 strict mode
  "use strict";

  // begin plugin
  $.sessionTimeout = function(options) {

    // set any defaults
    var defaults = {
        countdown: 60, // integer (in seconds, default 1 minute)
        keepAliveButton: 'Yes, keep me logged in', // button text
        keepAliveURL: '/keepalive', // keepalive url string
        logoutButton: 'No, log me out', // button text
        logoutURL: '/logout', // logout url string
        message: 'You will be logged out in <span>60</span> seconds.', // dialog message
        modal: true, // modal?
        question: 'Do you want to stay logged in?', // dialog question
        timeout: 900, // integer (in seconds, default 15 minutes)
        title: 'Your session is about to expire!', // dialog title
        width: 350 // width of dialog
      },

    // overwrite 'defaults' with those passed via 'options'
      settings = $.extend(defaults, options),

      timeout = $(document).data('session-timeout'),

    // private methods
      _timeout = {
        init: function() {
          // store timeout
          timeout = $(document).data('session-timeout', this);

          // start dialog timer
          this.setTimer();
        },

        setTimer: function() {
          // current instance
          var _this = this;

          // save timeout reference
          _this.timeout = window.setTimeout(function() {
            // create dialog when timeout occurs
            _this.showDialog();
          }, (settings.timeout - settings.countdown) * 1000);

        },

        resetTimer: function() {
          var _this = this;

          // clear current timeout
          window.clearTimeout(_this.timeout);

          // reset countdown
          _this.resetCountdown();

          // set new timer
          _this.setTimer();
        },

        showDialog: function() {
          // current instance
          var _this = this;

          // !dialog exist already?
          if (!_this.$dialog) {
            // build dialog
            _this.$dialog = $('<div id="jq-session-timeout-dialog"></div>');

            _this.$dialog
              .append('<p id="jq-session-timeout-message">' + settings.message + '</p>')
              .append('<p>' + settings.question + '</p>')
              .appendTo('body')
              .dialog({
                buttons: [{
                  text: settings.keepAliveButton,
                  click: function() {
                    $(this).dialog('close');
                    _this.keepAlive();
                  }
                }, {
                  text: settings.logoutButton,
                  click: function() { _this.logout(); }
                }],
                modal: settings.modal,
                title: settings.title,
                width: settings.width
              }).dialog('open');
          } else {
            // show existing dialog
            _this.$dialog.dialog('open');
          }

          // begin dialog countdown
          _this.beginCountdown();

        },

        beginCountdown: function() {
          // update dialog with time left before timeout
          var _this = this,
            seconds = settings.countdown;

          _this.countdown = window.setInterval(function() {
            _this.$dialog
              .find('#jq-session-timeout-message > span')
              .text(seconds--);

            if (seconds < 0) {
              // logout
              _this.logout();
            }
          }, 1000);

        },

        resetCountdown: function() {
          // stop countdown
          window.clearInterval(this.countdown);

          // reset dialog countdown message
          if (this.$dialog) {
            this.$dialog
              .find('#jq-session-timeout-message > span')
              .text(settings.countdown);
          }
        },

        keepAlive: function() {
          // reset countdown
          this.resetTimer();

          // get request using settings.keepAliveURL
          $.get(settings.keepAliveURL)
            .fail(this.logout);

          // start dialog timer over
          this.dialogTimer();
        },

        logout: function() {

          // redirect to settings.logoutURL
          window.location.replace(settings.logoutURL);
        }
      };

    // avoid multiple timeouts
    if (timeout) {
      // reset existing timeout
      _timeout.resetTimer.apply(timeout, arguments);
    } else {
      // start _timeout
      _timeout.init();
    }

  };
})(jQuery);
// end session timeout