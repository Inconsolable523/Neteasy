/**
 *  Created by zhichao on 2016/12/27.
 */

var module = (function () {
    var index = {
        state: {
            hasLogin: false
        },
        init: function () {
            // 获取状态
            index.state.hasLogin = utils.cookie('loginSuc');
            if (index.state.hasLogin) {
                document.getElementById('J_care').style.display = "none";
                document.getElementById('J_followed').style.display = "inline-block";
            }

            index.topbarControl();
            index.bindStar();
            index.login.init();
            index.carousel();
            index.contentSwitch();
            index.playVideo();
            index.hotList();

        },
        // 接口
        API: {
            getCoures: 'https://study.163.com/webDev/couresByCategory.htm',
            getHotcoures: 'https://study.163.com/webDev/hotcouresByCategory.htm',
            changeFollowState: 'https://study.163.com/webDev/attention.htm',
            login: 'https://study.163.com/webDev/login.htm',
            hotList: 'https://study.163.com/webDev/hotcouresByCategory.htm'

        },
        //顶栏不再提示
        topbarControl: function () {
            var $pre = document.getElementById("J_tips");
            var $del = document.getElementById("J_delete");
            //utils.cookie('prelose', 'false', {expires: 7, path: '/'});//FIXME:测试

            if (utils.cookie('prelose') !== 'true') {
                utils.fade.fadeIn($pre);
            }

            $del.addEventListener('click', function () {
                utils.cookie('prelose', 'true', {expires: 7, path: '/'});
                utils.fade.fadeOut($pre);
            }, false);
        },
        //关注"网易"
        bindStar: function () {
            var $login = document.getElementById("J_login"),
                $bg = document.getElementById("J_background"),
                $remove = document.getElementById("J_remove"),
                $care = document.getElementById('J_care'),
                $followd = document.getElementById('J_followed'),
                $fansNum = document.getElementById("J_fansNum");

            $care.addEventListener("click", function () {
                //如果未设置cookie,弹出登录框
                //utils.cookie('loginSuc','false', {expires: 7, path: '/'});//FIXME:测试
                if (utils.cookie('loginSuc') !== 'true') {
                    $login.style.display = 'block';
                    $bg.style.display = 'block';
                } else {
                    index.login._followed();
                }
            }, false);

            $remove.addEventListener("click", function () {
                $care.style.display = "inline-block";
                $followd.style.display = 'none';
                var fans = parseInt($fansNum.innerText);
                $fansNum.innerText = fans - 1;
            }, false)
        },
        //登录
        login: {
            init: function () {
                var self = this,
                    $loginIn = document.getElementById("J_login-in"),
                    $uname = document.getElementById('J_uname'),
                    $upassword = document.getElementById('J_upassword'),
                    $login = document.getElementById("J_login"),
                    $bg = document.getElementById("J_background");

                var data = {
                    userName: '',
                    password: ''
                };

                $loginIn.addEventListener("click", _login, false);
                function _login() {
                    data.userName = hex_md5($uname.value.trim());
                    data.password = hex_md5($upassword.value);
                    $loginIn.innerHTML = '登录中..';

                    utils.ajax.get(index.API.login, 'userName=' + data.userName + '&' + 'password=' + data.password, function (a) {
                        if (a == 1) {
                            index.state.hasLogin = true;
                            //登录成功
                            utils.cookie('loginSuc', 'true', {expires: 7, path: '/'});
                            $loginIn.innerHTML = '登录成功';

                            // 隐藏登录框
                            $login.style.display = 'none';
                            $bg.style.display = 'none';

                            self._followed();
                        }
                        else {
                            alert("账号或密码错误");
                            $loginIn.innerHTML = '登录';
                        }
                    });

                }

                self._close();
            },
            _followed: function () {
                var $care = document.getElementById('J_care'),
                    $followd = document.getElementById('J_followed'),
                    $fansNum = document.getElementById("J_fansNum");

                utils.ajax.get(index.API.changeFollowState, '', function (b) {
                    if (b == 1) {
                        //设置关注成功cookie
                        utils.cookie('followSuc', 'true', {expires: 7, path: '/'});
                        $care.style.display = "none";
                        $followd.style.display = "inline-block";
                        var fans = parseInt($fansNum.innerText);
                        $fansNum.innerText = fans + 1;
                    }
                    else {
                        alert("关注失败!");
                    }
                });
            },
            _close: function () {
                var $close = document.getElementById("J_close"),
                    $login = document.getElementById("J_login"),
                    $bg = document.getElementById("J_background");

                $close.addEventListener("click", function () {
                    $login.style.display = "none";
                    $bg.style.display = "none";
                }, false)
            }
        },
        //新轮播
        carousel: function () {
            var dBannerWrapper = document.getElementById("J_header-banner"),
                dImgs = document.getElementsByClassName('banner-img'),
                dDotsContainer = document.getElementById("J_btn"),
                dDots = dDotsContainer.getElementsByTagName('span'),
                timer = null,
                bindex = 1;

            dDotsContainer.addEventListener('click', function (e) {
                if (dDotsContainer.getElementsByClassName('on')[0].getAttribute('data-num') == e.target.getAttribute('data-num') || !e.target.getAttribute('data-num')) {
                    return
                }
                _turnToBanner(e.target.getAttribute('data-num'));
            }, false);
            dBannerWrapper.addEventListener('mouseover', function () {
                clearInterval(timer);
            });
            dBannerWrapper.addEventListener('mouseout', function () {
                _autoPlay();
            });
            // 抽象出跳转到某张图片的动作
            function _turnToBanner(index) {
                // 改变图片
                for (var i = 0; i < dImgs.length; i++) {
                    if (i != index) {
                        utils.fade.fadeOut(dImgs[i], 500);
                    }
                }
                utils.fade.fadeIn(dImgs[index], 500);
                // 改变按钮
                for (var i = 0; i < dDots.length; i++) {
                    utils.removeClass(dDots[i], 'on');
                }
                utils.addClass(dDots[index], 'on');
            }

            function _autoPlay() {
                timer = setInterval(function () {
                    _turnToBanner(bindex);
                    bindex++;
                    if (bindex > 2) {
                        bindex = 0;
                    }
                }, 5000);
            }

            _autoPlay();
        },
        //左侧内容区切换
        contentSwitch: function () {
            var $btn1 = document.getElementById("J_change1"),
                $btn2 = document.getElementById("J_change2"),
                screenWidth = document.body.clientWidth,
                isBigScreen = false;
            //var dtd = $.Deferred();
            //根据屏幕宽度显示不同的数据

            window.addEventListener('resize', function () {
                if (document.body.clientWidth <= 1206 && isBigScreen) {
                    index.getCorseCard(1, 15, $btn1.getAttribute('data-type'));
                    isBigScreen = false;
                } else if (document.body.clientWidth > 1206 && !isBigScreen) {
                    index.getCorseCard(1, 20, $btn1.getAttribute('data-type'));
                    isBigScreen = true;
                }

            });
            function change(elem) {
                if (screenWidth <= 1206) {
                    isBigScreen = false;
                    index.getCorseCard(1, 15, elem.getAttribute('data-type'));
                }
                else {
                    isBigScreen = true;
                    index.getCorseCard(1, 20, elem.getAttribute('data-type'));
                }
            }

            change($btn1);

            $btn1.addEventListener("click", function () {
                change($btn1);
                $btn2.className = " ";
                $btn1.className = "check";
            }, false);
            $btn2.addEventListener("click", function () {
                change($btn2);
                $btn1.className = " ";
                $btn2.className = "check";
            }, false);
        },
        /**
         * 获取课程卡片
         * @param pageNo    页码
         * @param psize     每页个数
         * @param type      分类
         */
        getCorseCard: function (pageNo, psize, type) {
            var $showPicture = document.getElementById("J_main-picture"),
                param = {
                    pageNo: pageNo,
                    psize: psize,
                    type: type
                };

            $showPicture.innerHTML = "内容加载中";
            utils.ajax.get(index.API.getCoures, 'pageNo=' + param.pageNo + '&psize=' + param.psize + '&type=' + param.type, function (rsp) {
                $showPicture.innerHTML = '';
                JSON.parse(rsp).list.forEach(function (elem) {
                    var tpl = _render(elem);
                    // 动态添加到dom中
                    var dom = document.createElement('div');
                    dom.innerHTML = tpl;
                    $showPicture.appendChild(dom);
                });

                // 渲染函数
                function _render(data) {
                    var price = data.price ? data.price : '免费',
                        freeStyle = data.price ? '' : 'color:#589135',
                        categoryName = data.categoryName ? data.categoryName : '暂无';
                    var tpl =
                        '\<dl class="m-content">' +
                        '\<dt class="u-picture">' +
                        '\<img src=' + data.middlePhotoUrl + ' alt="" width="222" height="124">' +
                            //课程内容详情
                        '\<div class="m-details">' +
                        '\<div class="u-header">' +
                        '\<img src=' + data.middlePhotoUrl + ' alt="" width="222" height="124">' +
                        '\<div class="u-info">' +
                        '\<h3 class="title">' + data.name + '\</h3>' +
                        '\<div class="leaner">' + data.learnerCount + '人在学' + '\</div>' +
                        '\<div class="distor">' +
                        '发布者:' + '\<a href=' + data.providerLink + ' target="_blank">' + data.provider + '\</a>' +
                        '\</div>' +
                        '\<div class="category">分类:' + categoryName + '\</div>' +
                        '\</div>' +
                        '\</div>' +
                        '\<div class="u-content1">' +
                        '\<p>' + data.description + '\</p>' +
                        '\</div>' +
                        '\</div>' +
                        '\</dt>' +
                        '\<dd class="u-content2">' +
                        '\<a href="javascript:;">' + data.name + '\</a>' +
                        '\<a class="style" href=' + data.providerLink + '>' + data.provider + '\</a>' +
                        '\<p class="count">' + '\<span>' + data.learnerCount + '\<span>' + '\</p>' +
                        '\<p class="checked" id="i-checked" style="' + freeStyle + '">' + price + '\</p>' +
                        '\</dd>' +
                        '\</dl>';
                    return tpl;
                }

                if (!index.lock) {
                    index.page.init(JSON.parse(rsp).pagination);
                    index.lock = 1;
                }
                // 分页
                index.page._draw(JSON.parse(rsp).pagination);
            });
        },
        //分页
        page: {
            init: function (data) {
                var self = this,
                    $prv = document.querySelector(".prv"),
                    $next = document.querySelector(".next"),
                    $listNumContainer = document.getElementById('J_classList');

                $listNumContainer.addEventListener('click', function (e) {
                    self._turnTopage(e.target.innerText, data);
                }, false);
                $prv.addEventListener("click", function () {
                    var pageIndex = document.querySelector(".list-checked").innerText;

                    pageIndex = pageIndex == '1' ? '1' : pageIndex - 1;
                    self._turnTopage(pageIndex, data);
                }, false);
                $next.addEventListener("click", function () {
                    var pageIndex = document.querySelector(".list-checked").innerText,
                        maxPage = document.querySelectorAll('.list-content-number').length;

                    if (pageIndex >= maxPage) {
                        pageIndex = maxPage;
                    } else {
                        pageIndex++;
                    }
                    self._turnTopage(pageIndex, data);
                }, false);

                //页面数字渲染
                this._draw(data);
            },

            //页面数字渲染
            _draw: function (data) {
                var tpl,
                    $list = document.getElementById("J_classList"),
                    $listBtn = document.getElementsByClassName('list-content-number');

                $list.innerHTML = '';
                for (var i = 1; i <= data.totlePageCount; i++) {
                    tpl = $list.innerHTML + '\<a href="javascript:;" class="list-content-number">' + i + '\</a>';
                    $list.innerHTML = tpl;
                }
                for (var i = 0; i < $listBtn.length; i++) {
                    utils.removeClass($listBtn[i], 'list-checked');
                }
                utils.addClass($listBtn[data.pageIndex - 1], 'list-checked');
            },

            // 跳到相应页面
            _turnTopage: function (pageNum, data) {
                var type = document.getElementById('J_leftChange').getElementsByClassName('check')[0].getAttribute('data-type');
                index.getCorseCard(pageNum, data.pageSize, type);
            }
        },
        //右侧视频介绍
        playVideo: function () {
            document.getElementById("J_play").addEventListener("click", function () {
                var $bg = document.getElementById("J_background"),
                    $showV = document.getElementById("J_showVideo");

                $bg.style.display = 'block';
                $showV.style.display = 'block';
                reMovePlay();
                //取消播放
                function reMovePlay() {
                    document.getElementById("J_reMovePlay").addEventListener("click", function () {
                        $showV.style.display = 'none';
                        $bg.style.display = 'none';
                    }, false)
                }
            }, false)
        },
        //右侧热门推荐
        hotList: function () {
            utils.ajax.get(index.API.hotList, '', function (rsp) {
                var $hot = document.getElementById("J_hot");

                JSON.parse(rsp).forEach(function (elem) {
                    var data = {
                        smallPhotoUrl: elem.smallPhotoUrl,
                        name: elem.name,
                        learnerCount: elem.learnerCount
                    };
                    var tpl = rander(data);
                    var dom = document.createElement('div');
                    dom.innerHTML = tpl;
                    $hot.appendChild(dom);
                });

                //动态渲染
                function rander(data) {
                    var tpl =
                        '\<li class="u-hotRank J_hotRank">' +
                        '\<img src=' + data.smallPhotoUrl + '\>' +
                        '\<a href="#">' + data.name + '\</a>' +
                        '\<br/>' +
                        '\<span>' + data.learnerCount + '\</span>' +
                        '\</li>';
                    return tpl;
                }

                var timer = null;
                var i = 0;

                scrol();
                //轮播滚动
                function scrol() {
                    var $test = document.getElementsByClassName("J_hotRank");
                    timer = setInterval(function () {
                        $test[i].style.display = 'none';
                        i++;
                        if (i >= 10) {
                            for (var j = 0; j < 10; j++) {
                                $test[j].style.display = 'block';
                            }
                            i = 0;
                        }
                    }, 5000);
                }

                //鼠标移入停止播放
                $hot.addEventListener("mouseover", function () {
                    clearInterval(timer);
                }, false);
                $hot.addEventListener("mouseout", function () {

                    scrol();
                }, false);
            });
        }
    };
    index.init();
})(window.module || {});