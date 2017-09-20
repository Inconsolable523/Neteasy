/**
 *  Created by zhichao on 2017/1/6.
 *  常用函数封装
 *  ps:由于项目不允许使用模块化框架,遂直接开辟一个全局命名空间(window.utils)以存放此模块
 */

;
(function (factory) {
    var registeredInModuleLoader = false;
    if (typeof define === 'function' && define.amd) {
        define(factory);  // AMD requireJS
        registeredInModuleLoader = true;
    }
    if (typeof exports === 'object') {
        module.exports = factory(); // CMD
        registeredInModuleLoader = true;
    }
    if (!registeredInModuleLoader) {
        var Oldutils = window.utils;
        var api = window.utils = factory();
        api.noConflict = function () {
            window.utils = Oldutils;
            return api;
        };
    }
}(function () {
    return {
        // ajax封装
        ajax: {
            get: function (url, data, callback) {
                var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

                function checkTimeout() {
                    if (xhr.readyState !== 4) {
                        aborted = true;
                        xhr.abort();//关闭请求
                    }
                }
                if (data) {
                    url = url + '?' + data;
                }
                setTimeout(checkTimeout, 5 * 1000);//设置超时时间
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        callback(xhr.responseText);
                    }
                };

                xhr.open('GET', url, true);
                xhr.send();

            },
            post: function (url, params, callback) {
                var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

                function checkTimeout() {
                    if (xhr.readyState !== 4) {
                        aborted = true;
                        xhr.abort();
                    }
                }

                setTimeout(checkTimeout, 5 * 1000);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        callback(xhr.responseText);
                    }
                };
                xhr.open('POST', url, true);
                xhr.send(params);
            }

        },

        // Cookies
        cookie: function (name, value, options) {
            if (typeof value != 'undefined') {
                options = options || {};
                //如果值为null, 删除cookie
                if (value === null) {
                    value = '';
                    options = {
                        expires: -1
                    };
                }
                //设置有效期
                var expires = '';
                if (options.expires && (typeof options.expires == 'number' || options.expires.toGMTString)) {
                    var date;
                    if (typeof options.expires == 'number') {
                        date = new Date();
                        date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                    } else {
                        date = options.expires;
                    }
                    expires = ';expires=' + date.toGMTString();
                }
                var path = options.path ? ';path=' + (options.path) : '';
                var domain = options.domain ? ';domain=' + (options.domain) : '';
                var secure = options.secure ? ';secure' : '';
                //设置cookie
                document.cookie = [ name, '=', encodeURIComponent(value), expires, path, domain, secure ].join('');
            } else {
                //读取cookie
                if (document.cookie.length > 0) {
                    var start = document.cookie.indexOf(name + "=")
                    if (start != -1) {
                        start = start + name.length + 1;
                        var end = document.cookie.indexOf(";", start);
                        if (end == -1) {
                            end = document.cookie.length;
                        }
                        return decodeURIComponent(document.cookie.substring(start, end));
                    }
                }
                return ""
            }
        },
        addClass: function (dom, iclass) {
            var className = dom.className;
            className = className + " " + iclass;
            dom.className = className;
        },

        removeClass: function (dom, iclass) {
            var className = dom.className;
            if (!className) {
                return
            }
            className = className.replace(iclass, "");
            dom.className = className;
        },
        replaceClass: function (dom, iclass, toClassName) {
            var className = dom.className;
            className = className.replace(iclass, toClassName);
            dom.className = className;
        },
        fade: {
            //设置元素透明度,透明度值按IE规则计,即0~100
            SetOpacity: function (ev, v) {
                ev.filters ? ev.style.filter = 'alpha(opacity=' + v + ')' : ev.style.opacity = v / 100;
            },
            /**
             * 淡入效果
             * @param elem 需要淡入的元素
             * @param speed 淡入速度,正整数(可选)
             * @param opacity 淡入到指定的透明度,0~100(可选)
             */
            fadeIn: function (elem, speed, opacity) {
                var _this = this;

                speed = speed || 10;
                opacity = opacity || 100;

                // elem.style.display = 'block';
                var val = 0;
                (function increasing() {
                    //循环将透明值以5递增,即淡入效果
                    _this.SetOpacity(elem, val);
                    val += 5;
                    if (val <= opacity) {
                        setTimeout(increasing, speed / 25)
                    }
                })()
            },
            //淡出效果
            fadeOut: function (elem, speed, opacity) {
                var _this = this;

                speed = speed || 10;
                opacity = opacity || 0;

                var val = 100;

                (function decreasing() {
                    _this.SetOpacity(elem, val);
                    val -= 5;
                    if (val > opacity) {
                        setTimeout(decreasing, speed / 25);
                    } else if (val <= 0) {
                        //元素透明度为0后隐藏元素
                        return;
                        // elem.style.display = 'none';
                    }
                })()
            }
        }
    }
}));

