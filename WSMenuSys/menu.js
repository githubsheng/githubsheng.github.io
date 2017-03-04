/**
 * Created by wangsheng on 4/3/17.
 */

class MenuSystem {

    constructor(containerId, root){
        this.count_ready_to_fly_in_command = 0;
        this.count_ready_to_fly_in_navigation = 0;
        this.fly_in_button_interval_id = null;
        this.navigation_buttons_showing = [];

        this.$menuSys = $(this.readyDom(containerId));
        this.linkParent(root);
        root.nextLevel.forEach(c => this.configure_command_button(c));
        this.fly_in_button();
    }

    readyDom(containerId){
        let menuSys = document.createElement("div");
        menuSys.classList.add("integrated-menu-system");

        for(let i = 0; i < 8; i++) {
            let navBtn = document.createElement("div");
            navBtn.classList.add("navigation");
            navBtn.innerText = "navigation";
            menuSys.appendChild(navBtn);
        }

        let canvas = document.createElement("canvas");
        menuSys.appendChild(canvas);

        for(let i = 0; i < 8; i++) {
            let comBtn = document.createElement("div");
            comBtn.classList.add("command");
            comBtn.innerText = "command";
            menuSys.appendChild(comBtn);
        }

        document.getElementById(containerId).appendChild(menuSys);
        canvas.classList.add("menu-system-background");
        canvas.width = 1210;
        canvas.height = 90;

        let ctx = canvas.getContext("2d");
        ctx.strokeStyle = "gray";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(100, 45);
        ctx.lineTo(1100, 45);
        ctx.stroke();
        ctx.restore();
        return menuSys;
    }

    linkParent(s){
        s.nextLevel.forEach(c => {
            c._parent = s;
            this.linkParent(c);
        });
    }

    createOnClickActionForCommandButton(s) {
        let a = function(){
            let navBtn = this.configure_navigation_button(s);
            this.mark_all_command_button_removal_ready();
            function flyOutCallback(){
                //create command buttons for each of its children
                s.nextLevel.forEach( c => this.configure_command_button(c));
                this.fly_in_button();
            }
            this.fly_out_button(flyOutCallback.bind(this));
            this.navigation_buttons_showing.push(navBtn);
        };
        return a.bind(this);
    }

    createOnClickActionForNavigationButton(s) {
        let a = function(){
            let nbs = this.navigation_buttons_showing;
            let idx = nbs.indexOf(s._button);
            let deleted = nbs.splice(idx, nbs.length);
            deleted.forEach($btn => this.mark_button_removal_ready($btn));
            this.mark_all_command_button_removal_ready();
            this.fly_out_button(() => {
                s._parent.nextLevel.forEach( c => this.configure_command_button(c));
                this.fly_in_button();
            })
        };
        return a.bind(this);
    }

    /**
     * lock the entire menu, user interaction is temporarily disabled
     * 暂时锁住整个菜单，用户暂时无法点击按钮
     */
    lock(){
        this.$menuSys.find(".navigation, .command").css("pointer-events", "none");
    }

    /**
     * unlock the menu, user interaction is enabled
     * 解锁菜单，用户点击菜单里面的按钮
     */
    unlock(){
        this.$menuSys.find(".navigation, .command").css("pointer-events", "");
    }

    /**
     * configure a navigation button. this includes setting the button's label, and its callback.
     * all the buttons are reused. this function will find the first available button and configure it.
     * once the button is configured, it is marked as "ready to fly in"
     * 设置一个上层按钮，包括设置按钮的文字以及按钮的点击动作
     * 所有按钮都是复用的，这里会自动找到第一个可用的按钮并且进行设置
     * 一旦按钮设置完毕，将被标记为"准备飞入"下一次调用｀fly_in_button｀的时候便会飞入
     */
    configure_navigation_button(s) {
        let $button = this.$menuSys.find(".navigation:not(.js-configured)").eq(0);
        $button.text(s.label);
        $button.click(this.createOnClickActionForNavigationButton(s)); //add the passed in listener.
        s._button = $button;
        $button.addClass("js-configured");
        this.count_ready_to_fly_in_navigation++;
        return $button;
    }

    /**
     * configure a command button. this includes setting the button's label, and its callback.
     * all the buttons are reused. this function will find the first available button and configure it.
     * once the button is configured, it is marked as "ready to fly in"
     * 设置一个下层按钮，包括设置按钮的文字以及按钮的点击动作
     * 所有按钮都是复用的，这里会自动找到第一个可用的按钮并且进行设置
     * 一旦按钮设置完毕，将被标记为"准备飞入"下一次调用｀fly_in_button｀的时候便会飞入
     */
    configure_command_button(s) {
        let $button = this.$menuSys.find(".command:not(.js-configured)").eq(0);
        $button.text(s.label);
        $button.click(this.createOnClickActionForCommandButton(s));
        s._button = $button;
        $button.addClass("js-configured");
        this.count_ready_to_fly_in_command++;
        return $button;
    }

    /**
     * make buttons fly in. Only those buttons that are marked as "ready to fly in" will fly in
     * 让所有被标记为"准备飞入"的按钮飞入
     */
    fly_in_button() {
        this.lock();
        /* first of all I will test if there are more than 5 navigation buttons or more than 5 command buttons */
        if (this.count_ready_to_fly_in_command > 5) {
            //immediately bring in all command buttons
            this.$menuSys.find(".command.js-configured:not(.fly-in)").addClass("fly-in");
            //reset counter to 0;
            this.count_ready_to_fly_in_command = 0;
        } else if (this.count_ready_to_fly_in_navigation > 5) {
            //immediately bring in all navigation buttons
            this.$menuSys.find(".command.js-configured:not(.fly-in)").addClass("fly-in");
            //reset counter to 0;
            this.count_ready_to_fly_in_navigation = 0;
        }

        //When the app executes to this point, all buttons that requires immediate fly-in has been brought in.
        //I use 'fly_in_button_utl' to fly in buttons at an interval of 200 milliseconds.
        if(this.count_ready_to_fly_in_command === 0 && this.count_ready_to_fly_in_navigation === 0){
            setTimeout(this.unlock.bind(this), 1000);//button still needs 1000 milliseconds to fly....
            return;
        }
        //fly in one command/navigation button immediately. I need to fly in one now because 'window.setInterval' only
        //execute the 'fly_in_button_util' 200 milliseconds after I call 'setInterval'.
        this.fly_in_button_util();
        //then fly in one at an interval of 200 milliseconds, staring the first call in 200 milliseconds.
        this.fly_in_button_interval_id = setInterval(this.fly_in_button_util.bind(this),200);
    }

    fly_in_button_util(){
        //checks if there are buttons that need to be brought in, if there is, bring in one button 
        if(this.count_ready_to_fly_in_command > 0){
            let $button = this.$menuSys.find(".command.js-configured:not(.fly-in)").eq(0);
            $button.addClass("fly-in");
            // this.currently_shown_buttons.push($button);
            this.count_ready_to_fly_in_command--;
        }

        if(this.count_ready_to_fly_in_navigation > 0){
            let $button = this.$menuSys.find(".navigation.js-configured:not(.fly-in)").eq(0);
            $button.addClass("fly-in");
            // this.currently_shown_buttons.push($button);
            this.count_ready_to_fly_in_navigation--;
        }

        //if there are no more command buttons or navigation buttons that need to be brought in, clear the interval.
        if(this.count_ready_to_fly_in_command < 1 && this.count_ready_to_fly_in_navigation < 1){
            clearInterval(this.fly_in_button_interval_id);
            //now that no more buttons need to be brought in, I can unlock the this.
            setTimeout(this.unlock.bind(this), 1000);//the last button still needs 1000 milliseconds to fly....
        }
    }

    /**
     * make buttons fly out. Only those that are marked as "ready to fly out" will fly out.
     * 将所有标记为"准备飞出"的按钮飞出
     * @param callback called when all the buttons have completely flied out. Typically you would configure
     * new buttons and fly them in at this point.
     */
    fly_out_button(callback){
        let $target_buttons = this.$menuSys.find(".fly-in:not(.js-configured)");

        function transitionEndCallback(){
            if(callback) {
                //if i remove all listeners as soon as the transition starts, or before the transition starts, then
                //i will remove this `transitionEndCallback` listener too. To avoid this, I can only remove all the listeners
                //registered to this button, after the transition animation ends.
                //如果一个开始就移除所有listener的话，那么transitionEndCallback也会被移除。所以我要等到这里才开始移除listener
                $target_buttons.off();
                callback();
                // this.registered_fly_in_configuration();
                // this.fly_in_button();
                //
                // this.registered_fly_in = false; //重置
                // this.registered_fly_in_configuration = null; //重置
            }

        }
        //since all buttons fly out at the same time, I only need to register transition end listener to one of them.
        //因为所有的按钮都是同时飞出，我只需要给其中一个加transitionEnd的listener.
        $target_buttons.eq(0).on("webkitTransitionEnd", transitionEndCallback);
        //this will make the buttons start to fly out
        //开始飞出
        $target_buttons.text("").removeClass("fly-in");
    }

    /**
     * mark all command buttons as "ready to fly out", they will fly out when next time `fly_out_button` is invoked.
     * 将所有下层按钮标记为"准备飞出"。从而使这些按钮在下一次fly_out_button调用时被飞出
     */
    mark_all_command_button_removal_ready() {
        this.$menuSys.find(".command.fly-in.js-configured").removeClass("js-configured");
    }

    mark_button_removal_ready($button) {
        $button.removeClass("js-configured");
    }

}