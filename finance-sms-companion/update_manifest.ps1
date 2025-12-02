$path = "android\app\src\main\AndroidManifest.xml"
if (Test-Path $path) {
    $content = Get-Content $path -Raw
    $insertion = @"
        <receiver android:name=".SMSReceiver" android:exported="true" android:permission="android.permission.BROADCAST_SMS">
            <intent-filter android:priority="999">
                <action android:name="android.provider.Telephony.SMS_RECEIVED"/>
            </intent-filter>
        </receiver>
        <service android:name=".SMSForwardService" android:exported="false"/>
    </application>
"@
    # Check if already added to avoid duplication
    if ($content -notmatch "SMSReceiver") {
        $newContent = $content -replace '</application>', $insertion
        Set-Content $path $newContent
        Write-Host "Manifest updated successfully"
    } else {
        Write-Host "Manifest already contains SMSReceiver"
    }
} else {
    Write-Error "AndroidManifest.xml not found at $path"
}
