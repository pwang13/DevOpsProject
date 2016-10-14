var subject = require('./mystery.js')
var mock = require('mock-fs');
subject.inc(-101,76);
subject.inc(-1001,76);
subject.inc(-101,771);
subject.inc(-1001,771);
subject.inc(-100,77);
subject.weird(86,69,421,'stricter');
subject.weird(86,69,421,"strictly");
subject.weird(86,69,421,'lalla');
subject.weird(86,69,41,'bob');
subject.weird(86,69,41,"strictly");
subject.weird(86,69,41,'lalla');
subject.weird(86,701,421,'stricter');
subject.weird(86,701,421,"strictly");
subject.weird(86,701,421,'lalla');
subject.weird(86,701,41,'bob');
subject.weird(86,701,41,"strictly");
subject.weird(86,701,41,'lalla');
subject.weird(871,69,421,'stricter');
subject.weird(871,69,421,"strictly");
subject.weird(871,69,421,'lalla');
subject.weird(871,69,41,'bob');
subject.weird(871,69,41,"strictly");
subject.weird(871,69,41,'lalla');
subject.weird(871,701,421,'stricter');
subject.weird(871,701,421,"strictly");
subject.weird(871,701,421,'lalla');
subject.weird(871,701,41,'bob');
subject.weird(871,701,41,"strictly");
subject.weird(871,701,41,'lalla');
subject.weird(87,70,42,"strictly");
mock({"pathContent":{},"path/fileExists":{}});
	subject.fileTest('pathContent/file1','path/fileExists');
mock.restore();
mock({"pathContent":{},"path/fileExists":{"file1":"hello"}});
	subject.fileTest('pathContent/file1','path/fileExists');
mock.restore();
mock({"pathContent":{},"path/fileExists":{}});
	subject.fileTest('pathContent/file1','path/fileExists');
mock.restore();
mock({"pathContent":{},"path/fileExists":{"file1":"hello"}});
	subject.fileTest('pathContent/file1','path/fileExists');
mock.restore();
mock({"pathContent":{},"path/fileExists":{}});
	subject.fileTest('pathContent/file1','path/fileExists');
mock.restore();
mock({"pathContent":{"file1":""},"path/fileExists":{"file1":""}});
	subject.fileTest('pathContent/file1','path/fileExists');
mock.restore();
mock({"pathContent":{},"path/fileExists":{}});
	subject.fileTest('pathContent/file1','path/fileExists');
mock.restore();
mock({"pathContent":{"file1":"hi"},"path/fileExists":{"file1":"hello"}});
	subject.fileTest('pathContent/file1','path/fileExists');
mock.restore();
mock({"path/fileExists":{},"pathContent":{}});
	subject.fileTest('pathContent/file1','path/fileExists');
mock.restore();
mock({"path/fileExists":{"file1":"hello"},"pathContent":{}});
	subject.fileTest('pathContent/file1','path/fileExists');
mock.restore();
mock({"path/fileExists":{},"pathContent":{}});
	subject.fileTest('pathContent/file1','path/fileExists');
mock.restore();
mock({"path/fileExists":{"file1":"hello"},"pathContent":{}});
	subject.fileTest('pathContent/file1','path/fileExists');
mock.restore();
mock({"path/fileExists":{},"pathContent":{}});
	subject.fileTest('pathContent/file1','path/fileExists');
mock.restore();
mock({"path/fileExists":{"file1":""},"pathContent":{"file1":""}});
	subject.fileTest('pathContent/file1','path/fileExists');
mock.restore();
mock({"path/fileExists":{},"pathContent":{}});
	subject.fileTest('pathContent/file1','path/fileExists');
mock.restore();
mock({"path/fileExists":{"file1":"hello"},"pathContent":{"file1":"hi"}});
	subject.fileTest('pathContent/file1','path/fileExists');
mock.restore();
subject.fileTest('pathContent/file1','path/fileExists');
subject.normalize('');
subject.format('907-650-2158','1-###-###-#### x###',{normalize: true});
subject.format('218-986-4396','###.###.####',false);
subject.format('','',{normalize: true});
subject.blackListNumber('919-411-2566');
subject.blackListNumber('182-127-8685');
