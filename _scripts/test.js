var fso = new ActiveXObject("Scripting.FileSystemObject");
var f = fso.OpenTextFile("c:\\Users\\Lezli\\Desktop\\Diablo\\data.js", 1);
var code = f.ReadAll();
f.Close();

try {
    eval(code);
    WScript.Echo("Success");
} catch (e) {
    WScript.Echo("Error: " + e.message + " on line " + (e.line || "unknown"));
}
