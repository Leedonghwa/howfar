package com.samsung.android.hostapp.goodnaviproducer.service;

import android.app.Activity;
import android.widget.Toast;
 
public class BackPressCloseHandler {
 
    private long backKeyPressedTime = 0;
    private Toast toast;
 
    private Activity activity;
 
    public BackPressCloseHandler(Activity context) {
        this.activity = context;
    }
 
    public void onBackPressed() {
        if (System.currentTimeMillis() > backKeyPressedTime + 2000) {
            backKeyPressedTime = System.currentTimeMillis();
            showGuide();
            
            return;
        }
        if (System.currentTimeMillis() <= backKeyPressedTime + 2000) {
            activity.finish();
            toast.cancel();
            // android.os.Process.killProcess(android.os.Process.myPid());
        }
    }
 
    public void showGuide() {
        toast = Toast.makeText(activity,
                "click \'BACK\' button again to exit", Toast.LENGTH_SHORT);
        toast.show();
    }
}