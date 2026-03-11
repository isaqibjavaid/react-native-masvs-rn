import fs from 'fs';
import path from 'path';

type Finding = {
  level: 'FAIL' | 'WARN';
  rule: string;
  file: string;
  message: string;
};

function walk(dir: string, out: string[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        ['node_modules', 'ios/Pods', 'android/build', 'lib', 'dist'].includes(
          entry.name
        )
      )
        continue;
      walk(full, out);
    } else if (entry.isFile()) {
      if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) out.push(full);
    }
  }
  return out;
}

function scan(file: string): Finding[] {
  const text = fs.readFileSync(file, 'utf8');
  const findings: Finding[] = [];

  if (text.includes('http://')) {
    findings.push({
      level: 'FAIL',
      rule: 'MASVS-NETWORK-HTTP',
      file,
      message: 'Found http:// usage. Use HTTPS only.',
    });
  }

  if (
    text.includes('AsyncStorage') ||
    text.includes('@react-native-async-storage/async-storage')
  ) {
    findings.push({
      level: 'WARN',
      rule: 'MASVS-STORAGE-ASYNCSTORAGE',
      file,
      message:
        'AsyncStorage detected. Do not store secrets there; use secureStorage.',
    });
  }

  if (text.includes('console.log(')) {
    findings.push({
      level: 'WARN',
      rule: 'MASVS-CODE-LOGGING',
      file,
      message:
        'console.log detected. Ensure secrets are not logged in production.',
    });
  }

  return findings;
}

function main() {
  const target = process.argv[2]
    ? path.resolve(process.argv[2])
    : process.cwd();
  const files = walk(target);
  const findings = files.flatMap(scan);

  const fails = findings.filter((f) => f.level === 'FAIL');
  const warns = findings.filter((f) => f.level === 'WARN');

  for (const f of findings) {
    console.log(`${f.level}  ${f.rule}  ${f.file}\n  ${f.message}\n`);
  }
  console.log(`Summary: ${fails.length} FAIL, ${warns.length} WARN`);
  process.exit(fails.length ? 1 : 0);
}

main();
