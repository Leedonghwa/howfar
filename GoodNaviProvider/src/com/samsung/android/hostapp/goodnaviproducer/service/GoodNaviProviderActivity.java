package com.samsung.android.hostapp.goodnaviproducer.service;

import org.apache.http.util.EncodingUtils;

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

public class GoodNaviProviderActivity extends Activity {

	private static final String TAG = "GoodNaviProviderActivity";

	public static boolean isUp = false;
	private Context mContext;
	private BackPressCloseHandler mBackPressCloseHandler;
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

		@Override
		public void onPageFinished(WebView view, String url) {
			Log.d(TAG, "onPageFinished");
			Intent i = getIntent();
			if (i.getAction().equalsIgnoreCase("gearAlarm")) {
				Log.d(TAG, "onPageFinished gearAlarm");
				mWebView.loadUrl("javascript:G.locationModule.setIsGearConnected(true)");
				sendBookmarkToGear();
			}
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
		public boolean onJsAlert(WebView view, String url, String message,
				JsResult result) {
			Log.d("LogTag", message);
			result.confirm();
			return true;
		}
	}

	// WebView에서 안드로이드 함수 호출을 가능케 하는 bridge
	private class AndroidBridge {
		// 거리를 전송. 최초거리, 일반거리
		@JavascriptInterface
		public void sendDistance(final String message) {
			mHandler.post(new Runnable() {
				@Override
				public void run() {
					String packet = "A" + message;
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
		Log.d(TAG, "onCreate()");
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);

		isUp = true;
		mContext = getApplicationContext();
		mBackPressCloseHandler = new BackPressCloseHandler(this);
		mWebView = (WebView) findViewById(R.id.webview);

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
		mWebView.loadUrl("file:///android_asset/webApp.html");

		mContext.bindService(new Intent(getApplicationContext(),
				GoodNaviProviderService.class), this.mGNPConnection,
				Context.BIND_AUTO_CREATE);
	}

	public void onDestroy() {
		Log.d(TAG, "onDestroy()");
		stopGPSInWeb(); // 웹의 GPS를 멈춘다.
		finishGear(); // 기어를 종료
		super.onDestroy();
		isUp = false;
	}

	@Override
	protected void onStart() {
		Log.d(TAG, "onStart()");
		super.onStart();
		isUp = true;
	}

	@Override
	protected void onRestart() {
		Log.d(TAG, "onRestart()");
		// 추가 2
		mWebView.loadUrl("javascript:G.locationModule.setIsAndroidConnected(true)");
		mWebView.loadUrl("javascript:G.locationModule.runNavigator()");
		super.onRestart();
	}

	@Override
	protected void onStop() {
		Log.d(TAG, "onStop()");
		// 추가 2
		mWebView.loadUrl("javascript:G.locationModule.setIsAndroidConnected(false)");
		mWebView.loadUrl("javascript:G.locationModule.stopNavigator()");
		super.onStop();
	}

	@Override
	protected void onPause() {
		Log.d(TAG, "onPause()");
		super.onPause();
	}

	@Override
	protected void onResume() {
		Log.d(TAG, "onResume()");
		super.onResume();
		isUp = true;
	}

	@Override
	public void onBackPressed() {
		isUp = false;
		mBackPressCloseHandler.onBackPressed();
	}

	// message to web
	public void messageFromGearToWeb(String msg) {
		Log.d("messageFromGear", msg);

		if (msg.charAt(0) == 'A') {
			mWebView.loadUrl("javascript:G.bookmarkModule.searchAddressFromGear('"
					+ msg.substring(1) + "')");
			Log.d("messageFromGear", msg);
		}

		else if (msg.charAt(0) == 'B') {
			Log.d("messageFromGear", msg);
			if (msg.substring(1).equals("END")) {
				mWebView.loadUrl("javascript:G.locationModule.setIsGearConnected(false)");
				mWebView.loadUrl("javascript:G.locationModule.stopNavigator()");
			} else if (msg.substring(1).equals("START")) {
				mWebView.loadUrl("javascript:G.locationModule.setIsGearConnected(true)");
				mWebView.loadUrl("javascript:G.locationModule.runNavigator()");
			}
		}

	}

	// stop GPS in web
	public void stopGPSInWeb() {
		mWebView.loadUrl("javascript:G.locationModule.requestFromAndroidToStopGPS()");
	}

	public void finishGear() {
		mGNPService.sendData("DEND");
	}

	// if gear is disconnected,
	public void gearDisconnected() {
		mWebView.loadUrl("javascript:G.locationModule.setIsGearConnected(false)");
	}

	public void sendBookmarkToGear() {
		mWebView.loadUrl("javascript:G.bookmarkModule.sendBookmarkListToAndroid()");
	}
}