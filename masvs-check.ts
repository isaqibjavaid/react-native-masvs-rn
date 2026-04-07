import fs from 'fs';
import path from 'path';

type Level = 'FAIL' | 'WARN';

type Finding = {
  level: Level;
  rule: string;
  file: string;
  message: string;
};

type Rule = {
  id: string;
  level: Level;
  description: string;
  pattern: RegExp;
};

const IGNORED_DIRS = [
  'node_modules',
  'ios/Pods',
  'android/build',
  'dist',
  'lib',
  '.git',
  'src/cli', // ✅ exclude CLI code
];

const RULES: Rule[] = [
  // ---------------- NETWORK ----------------
  {
    id: 'MASVS-NET-HTTP',
    level: 'FAIL',
    description: 'Clear‑text HTTP detected. HTTPS is required.',
    pattern: /\bhttp:\/\//i,
  },

  {
    id: 'MASVS-NET-INSECURE-FETCH',
    level: 'WARN',
    description: 'Direct fetch() detected. Use secureFetch instead.',
    pattern: /\bfetch\s*\(/,
  },

  {
    id: 'MASVS-NET-AXIOS',
    level: 'WARN',
    description: 'axios detected. Ensure TLS pinning & HTTPS enforcement.',
    pattern: /\baxios\b/,
  },

  // ---------------- STORAGE ----------------
  {
    id: 'MASVS-STORAGE-ASYNCSTORAGE',
    level: 'WARN',
    description:
      'AsyncStorage detected. Do not store secrets there; use secureStorage.',
    pattern: /\bAsyncStorage\b|@react-native-async-storage\/async-storage/,
  },

  // ---------------- LOGGING ----------------
  {
    id: 'MASVS-CODE-LOGGING',
    level: 'WARN',
    description:
      'console.log detected. Ensure no secrets are logged in production.',
    pattern: /\bconsole\.log\s*\(/,
  },

  // ---------------- SECRETS ----------------
  {
    id: 'MASVS-SECRETS-HARDCODED',
    level: 'FAIL',
    description: 'Hardcoded secret detected.',
    pattern: /\b(apiKey|secret|token|password)\s*=\s*['"`]/i,
  },

  // ---------------- CRYPTO ----------------
  {
    id: 'MASVS-CRYPTO-INSECURE',
    level: 'WARN',
    description: 'Weak or insecure crypto detected.',
    pattern: /\b(md5|sha1|Math\.random)\b/i,
  },
];

function walk(dir: string, files: string[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.includes(entry.name)) continue;
      walk(fullPath, files);
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function scanFile(file: string): Finding[] {
  const content = fs.readFileSync(file, 'utf8');
  const findings: Finding[] = [];

  for (const rule of RULES) {
    if (rule.pattern.test(content)) {
      findings.push({
        level: rule.level,
        rule: rule.id,
        file,
        message: rule.description,
      });
    }
  }

  return findings;
}

function main() {
  const targetDir = process.argv[2]
    ? path.resolve(process.argv[2])
    : process.cwd();

  const files = walk(targetDir);
  const findings = files.flatMap(scanFile);

  const fails = findings.filter((f) => f.level === 'FAIL');
  const warns = findings.filter((f) => f.level === 'WARN');

  for (const f of findings) {
    console.log(`${f.level}  ${f.rule}\n  ${f.file}\n  ${f.message}\n`);
  }

  console.log(`Summary: ${fails.length} FAIL, ${warns.length} WARN`);

  process.exit(fails.length > 0 ? 1 : 0);
}

main();
