//rules used here: if a button is '.js-configured' but not '.fly-in', then it is ready to fly in.
//if a button is '.fly-in' but not '.js-configured', then it is ready to fly out.
//if a button is not '.fly-in' and not '.js-configured', then you can change its label, function and blabla...
var menu_system = {};

menu_system.count_ready_to_fly_in_command = 0;
menu_system.count_ready_to_fly_in_navigation = 0;
menu_system.registered_fly_in = false;
menu_system.registered_fly_in_configuration = null;
menu_system.fly_in_button_interval_id = null;

/*
 * 注意只有当一个按钮真正飞入的时候才会将这个按钮放入这个集合。如果你要飞出一个按钮的话，你可以在这里里面集合找那个按钮
 * 这个集合里应该放$button元素
 */
menu_system.currently_shown_buttons = [];

menu_system.get_shown_button_by_label = function(label){
	for(var idx in this.currently_shown_buttons){
		var $button = this.currently_shown_buttons[idx];
		if($button.text() === label){
			return $button;
		}
	}
	return null;
}

/**
 * 让一个按钮暂时失效，但是并不将次按钮飞出
 */
menu_system.disable_button = function($button){
	if($button !== null){
		$button.css("pointer-events", "none").css("background-color", "lightgray");
	}
}

menu_system.enable_button = function($button){
	if($button !== null){
		$button.css("pointer-events", "").css("background-color", "");
	}
}



menu_system.lock = function(){
	$("#integrated-menu-system .navigation, #integrated-menu-system .command").css("pointer-events", "none");
}

/*
 * this function is used to unlock the menu system. It 'removes' (by changing the z-index) the transparent layer and let the
 * user click on buttons in the menu system.
 */
menu_system.unlock = function(){
	$("#integrated-menu-system .navigation, #integrated-menu-system .command").css("pointer-events", "");
}

/*
 * This function configures a navigation button (button label, button function)
 * and put the button into the button group if a button group is passed in.
 * 
 * button_function is a function which you would like to invoke when the button is clicked.
 * $button_group is an array [$button]
 * 
 * Following is an example of how you can use this function:
 * 
 * You use this function to change a button's label to "Edit Survey", change its click function to
 * "function editSurvey()". 
 * Once the button is configured, it is marked by "js-configured" css class.
 * 
 * After you have configured one or several buttons, you can invoke 'menu_system.fly_in_button'
 * to fly in all the configured buttons. For details please see the docs for 'menu_system.fly_in_button'.
 * 
 * If you want to fly in the button immediately after you configure the button, you can just omit
 * the '$button_group' argument.
 * 
 * The button will be returned by this method. 
 */
menu_system.configure_navigation_button = function(button_label, button_function) {
	var $button = $("#integrated-menu-system .navigation:not(.js-configured)").eq(0);
	$button.text(button_label);
	//$button.off();//remove other listeners.
	$button.click(button_function); //add the passed in listener.
	$button.addClass("js-configured");

	menu_system.count_ready_to_fly_in_navigation++;
	
	return $button;
}

/*
 * This function configures a command button (button label, button function)
 * and put the button into the button group if a button group is passed in.
 * 
 * button_function is a function which you would like to invoke when the button is clicked.
 * $button_group is an array [$button]
 */
menu_system.configure_command_button = function(button_label, button_function) {
	var $button = $("#integrated-menu-system .command:not(.js-configured)").eq(0)
	$button.text(button_label);
	//$button.off(); I assume that when a button flies out, its associated function is also removed.
	$button.click(button_function);
	$button.addClass("js-configured");
	
	menu_system.count_ready_to_fly_in_command++;
	
	return $button;
};

/**
 * 这个方法用于注册滑块飞入。注册之后滑块将会在下一次滑块飞出动画完成之后自动滑入，你无须再手动调用fly_in_button。
 * 典型的用法是，你用这个方法来注册。注册完之后再飞出需要飞出的滑块。一旦滑块完成飞出动画之后，系统就会开始自动飞入需要飞入的滑块。
 *
 * 在注册的时候你需要传入一个function，这个function应该负责用configure_command_button或者configure_navigation_button来配置并标记好准备滑入的滑块。
 * 不要自行用configure_command_button或者configure_navigation_button自行配置（如果你要用这个方法）。将配置逻辑放在action里面，系统会
 * 在适当的时候调用来帮你配置。
 */
menu_system.fly_in_button_after_next_fly_out = function(action){
    this.registered_fly_in = true;
    menu_system.registered_fly_in_configuration = action;
}

/*
 * let one or more configured buttons fly in.
 * If there are less than or equal to 5 buttons, buttons are brought in at an interval of 200 milliseconds.
 * If there are more than 5 buttons, they are all immediately brought in at the same time.
 */
menu_system.fly_in_button = function() {
	//menu_system.lock();
	/* first of all I will test if there are more than 5 navigation buttons or more than 5 command buttons */
	if (menu_system.count_ready_to_fly_in_command > 5) {
		//immediately bring in all command buttons
		$("#integrated-menu-system .command.js-configured:not(.fly-in)").addClass("fly-in");
		//reset counter to 0;
		menu_system.count_ready_to_fly_in_command = 0;
	} else if (menu_system.count_ready_to_fly_in_navigation > 5) {
		//immediately bring in all navigation buttons
		$("#integrated-menu-system .command.js-configured:not(.fly-in)").addClass("fly-in");
		//reset counter to 0;
		menu_system.count_ready_to_fly_in_navigation = 0;
	} 
	
	//When the app executes to this point, all buttons that requires immediate fly-in has been brought in.
	//I use 'fly_in_button_utl' to fly in buttons at an interval of 200 milliseconds.
	if(menu_system.count_ready_to_fly_in_command === 0 && menu_system.count_ready_to_fly_in_navigation === 0){
		return;
	}
	//fly in one command/navigation button immediately. I need to fly in one now because 'window.setInterval' only
	//execute the 'fly_in_button_util' 200 milliseconds after I call 'setInterval'.
	menu_system.fly_in_button_util();
	//then fly in one at an interval of 200 milliseconds, staring the first call in 200 milliseconds.
	menu_system.fly_in_button_interval_id = setInterval(menu_system.fly_in_button_util,200);
};

/**
 * 这个方法可能作为一个独立function被setInterval调用，此时this变成document，而不是menu_system。
 */
menu_system.fly_in_button_util = function(){	
	//checks if there are buttons that need to be brought in, if there is, bring in one button 
	if(menu_system.count_ready_to_fly_in_command > 0){
		var $button = $("#integrated-menu-system .command.js-configured:not(.fly-in)").eq(0);
		$button.addClass("fly-in");
		menu_system.currently_shown_buttons.push($button);
		menu_system.count_ready_to_fly_in_command--;
	}
	
	if(menu_system.count_ready_to_fly_in_navigation > 0){
		var $button = $("#integrated-menu-system .navigation.js-configured:not(.fly-in)").eq(0);
		$button.addClass("fly-in");
		menu_system.currently_shown_buttons.push($button);
		menu_system.count_ready_to_fly_in_navigation--;
	}
	
	//if there are no more command buttons or navigation buttons that need to be brought in, clear the interval.
	if(menu_system.count_ready_to_fly_in_command < 1 && menu_system.count_ready_to_fly_in_navigation < 1){
		clearInterval(menu_system.fly_in_button_interval_id);
		//now that no more buttons need to be brought in, I can unlock the menu_system.
		setTimeout(menu_system.unlock, 1000);//the last button still needs 1000 milliseconds to fly....
	}
};

/*
 * This function is similar to 'fly_in_button' function. 
 * 
 * Notice that this function does not bring out buttons one by one, it brings all buttons(those you want to remove) immediately
 * at the same time, and it brings out all buttons instantly, without any transition or animation.
 * 
 * If you want to bring out a button, simply use remove its 'js-configured' marker. 
 * The 'fly_out_button' function finds those buttons that are marked with 'fly-in' but not with 'js-configured' 
 * and see them as buttons that need to be brought out.
 */
menu_system.fly_out_button = function(){
	var $target_buttons = $("#integrated-menu-system .fly-in:not(.js-configured)");
    //因为所有的按钮都是同时飞出，我只需要给其中一个加transitionEnd的listener.
    function letRegisteredFlyInStart(){
        if(menu_system.registered_fly_in) {
            $target_buttons.off(); //如果一个开始就移除所有listener的话，那么letRegisteredFlyInStart也会被移除。所以我要等到这里才开始移除listener
            menu_system.registered_fly_in_configuration();
            menu_system.fly_in_button();

            menu_system.registered_fly_in = false; //重置
            menu_system.registered_fly_in_configuration = null; //重置
        }

    }
    $target_buttons.eq(0).on("webkitTransitionEnd", letRegisteredFlyInStart);
    //开始飞出
	$target_buttons.text("").removeClass("fly-in");
    if(!menu_system.registered_fly_in){
        //如果没有注册，那么之后的飞入可能是手动控制立刻飞入。这个时候“webkiTransitionEnd”可能不会发生，因为在飞出动画完成前可能就被飞入动画给代替了
        //所以这里要提前取消所有listener
        $target_buttons.off();
    }
};

menu_system.mark_button_removal_ready = function($button){
    $button.removeClass("js-configured");
}

/**
 * 这个方法将所有的目前显示的命令按钮的js-configured去掉。从而使这些按钮在下一次fly_out_button调用时被飞出
 */
menu_system.mark_all_command_button_removal_ready = function(){
	$("#integrated-menu-system .command.fly-in.js-configured").removeClass("js-configured");
}

