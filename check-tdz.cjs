const fs = require('fs');
const path = require('path');

// Find all .tsx and .ts files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        findFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Check for TDZ violations in hooks
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const issues = [];
  const variables = new Map(); // variable name -> line number where defined
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for variable definitions (const, let, var)
    const varMatch = line.match(/^\s*(?:const|let|var)\s+(\w+)\s*=/);
    if (varMatch) {
      variables.set(varMatch[1], lineNum);
    }
    
    // Check for useMemo/useCallback that might use variables
    if (line.includes('useMemo') || line.includes('useCallback')) {
      // Extract dependencies array
      const depsMatch = content.substring(content.indexOf(line)).match(/\[([^\]]*)\]/);
      if (depsMatch) {
        const deps = depsMatch[1].split(',').map(d => d.trim().split('.')[0]);
        
        deps.forEach(dep => {
          if (dep && variables.has(dep)) {
            const defLine = variables.get(dep);
            if (defLine > lineNum) {
              issues.push({
                file: filePath,
                line: lineNum,
                variable: dep,
                definedAt: defLine,
                message: `Variable '${dep}' used at line ${lineNum} but defined later at line ${defLine}`
              });
            }
          }
        });
      }
    }
  });
  
  return issues;
}

// Main
const srcDir = path.join(__dirname, 'src');
const files = findFiles(srcDir);
console.log(`Checking ${files.length} files...\n`);

let totalIssues = 0;
files.forEach(file => {
  const issues = checkFile(file);
  if (issues.length > 0) {
    console.log(`\n❌ ${path.relative(__dirname, file)}`);
    issues.forEach(issue => {
      console.log(`   Line ${issue.line}: '${issue.variable}' used before definition (line ${issue.definedAt})`);
      totalIssues++;
    });
  }
});

if (totalIssues === 0) {
  console.log('✅ No TDZ violations found!');
} else {
  console.log(`\n⚠️  Found ${totalIssues} potential TDZ violations`);
}
