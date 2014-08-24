package com.samsung.android.hostapp.goodnaviproducer.service;

import com.samsung.android.hostapp.goodnaviproducer.service.GoodNaviProviderService.LocalBinder;

import android.app.ActionBar;
import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.util.Log;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;


public class GoodNaviProviderActivity extends Activity{
	
	private static final String TAG = "GoodNaviProviderActivity";
	
	 public static boolean isUp = false;
	 private Context mContext;
	 private GoodNaviProviderService mGNPService;
	 private final Handler mHandler = new Handler();
	 WebView mWebView;
	 
	 private ServiceConnection mGNPConnection = new ServiceConnection() {
	        @Override
	        public void onServiceDisconnected(ComponentName arg0) {
	            Log.d(TAG, "GNP service connection lost");
	            mGNPService = null;
	        }

	        @Override
	        public void onServiceConnected(ComponentName arg0, IBinder service) {
	            Log.d(TAG, "GNP service connected");
	            mGNPService = ((LocalBinder) service).getService();
	            ((LocalBinder) service).SetActivity(GoodNaviProviderActivity.this);
	        }
	    };
	 
    public class GeoWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            // When user clicks a hyperlink, load in the existing WebView
            view.loadUrl(url);
            return true;
        }
    }
 
    public class GeoWebChromeClient extends WebChromeClient {
        @Override
        public void onGeolocationPermissionsShowPrompt(String origin,
                GeolocationPermissions.Callback callback) {
            // Always grant permission since the app itself requires location
            // permission and the user has therefore already granted it
            callback.invoke(origin, true, false);
        }
        
        @Override
        public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
            Log.d("LogTag", message);
            result.confirm();
            return true;
        }
    }
    
    private class AndroidBridge {
    	 
    	// 최초 거리를 전송. A + 거리
    	@JavascriptInterface
    	public void sendInitDistance(final String message) {
    		mHandler.post(new Runnable() {
    			@Override
				public void run() {
    				String packet = "A" + message;
    				mGNPService.sendData(packet);
    				Log.d("AndroidBridge_InitDistance", packet);
				}
    		}); 
    	}
    	
    	// 거리를 전송. B + 거리
    	@JavascriptInterface
    	public void sendDistance(final String message) {
    		mHandler.post(new Runnable() {
    			@Override
				public void run() {
    				String packet = "B" + message;
    				mGNPService.sendData(packet);
    				Log.d("AndroidBridge_Distance", packet);
				}
    		});
    	}
    	
    	// 북마크 리스트를 전송. json의 string으로 전달
    	@JavascriptInterface
    	public void sendBookmarkList(final String message) {
    		mHandler.post(new Runnable() {
    			@Override
				public void run() {
    				String packet = "C" + message;
    				mGNPService.sendData(packet);
    				Log.d("AndroidBridge_Distance", packet);
				}
    		});
    	}
    }
 
    @Override
    public void onCreate(Bundle savedInstanceState) {
    	super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
    	isUp = true;
    	mContext = getApplicationContext();
    	
        mWebView = (WebView)findViewById(R.id.webview);
        
        // Brower niceties -- pinch / zoom, follow links in place
        mWebView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
        mWebView.getSettings().setBuiltInZoomControls(true);
        mWebView.setWebViewClient(new GeoWebViewClient());

        // Below required for geolocation
        mWebView.getSettings().setJavaScriptEnabled(true);
        mWebView.getSettings().setGeolocationEnabled(true);
        mWebView.addJavascriptInterface(new AndroidBridge(), "android");
        
        // local storage를 위한 설정
        mWebView.getSettings().setDatabaseEnabled(true); 
        mWebView.getSettings().setDomStorageEnabled(true);
        
        mWebView.setWebChromeClient(new GeoWebChromeClient());
        // Load web page
        mWebView.loadUrl("file:///android_asset/location_test01_7.13.html");
        
        mContext.bindService(new Intent(getApplicationContext(), GoodNaviProviderService.class), 
                this.mGNPConnection, Context.BIND_AUTO_CREATE);
    }
    
    public void onDestroy() {
        super.onDestroy();
        isUp = false;
    }

    @Override
    protected void onStart() {
        super.onStart();
        isUp = true;
    }
    
    @Override
    protected void onStop() {
        super.onStop();
        isUp = false;
    }
    
	@Override
    protected void onPause() {
        super.onPause();
        isUp = false;
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        isUp = true;
    }
 
    @Override
    public void onBackPressed() {
        // Pop the browser back stack or exit the activity
    	//super.onBackPressed();
    	android.os.Process.killProcess(android.os.Process.myPid());
        isUp = false;
        
        /*
    	if (mWebView.canGoBack()) {
            mWebView.goBack();
        }
        else {
            super.onBackPressed();
            isUp = false;
        }
        */
    }
    
    public void messageFromGear(String msg) {
    	mWebView.loadUrl("javascript:searchAddressFromGear('"+msg+"')");
    	Log.d("messageFromGear", msg);
    }
}
