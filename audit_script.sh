cat > /tmp/audit_script.sh << 'EOF'
#!/bin/bash

# Script audit léger - à runner dans ton projet MADSuite root

echo "=== AUDIT ROUTES LEINN & DATA FLOW ==="
echo ""

# 1. Find routes files
echo "📍 Routes trouvées:"
find . -name "*.routes.js" -o -name "*leinn*" -o -name "*activity*" | grep -E "(routes|leinn)" | head -10

echo ""
echo "🔍 Frontend components avec 'leinn' ou 'projet':"
find . -path "./node_modules" -prune -o -name "*.jsx" -type f -exec grep -l "leinn\|Leinn\|projet.*display" {} \; 2>/dev/null | head -8

echo ""
echo "📡 Endpoints POST/PUT (backend):"
grep -r "router\.\(post\|put\)" --include="*.routes.js" | grep -i "leinn\|project\|activity" | head -10

echo ""
echo "💾 Appels fetch/axios (frontend):"
grep -r "fetch\|axios\|\/api\/" --include="*.jsx" --include="*.js" | grep -E "(leinn|project|POST|PUT)" | head -10

EOF
chmod +x /tmp/audit_script.sh
cat /tmp/audit_script.sh
Sortie

#!/bin/bash

# Script audit léger - à runner dans ton projet MADSuite root

echo "=== AUDIT ROUTES LEINN & DATA FLOW ==="
echo ""

# 1. Find routes files
echo "📍 Routes trouvées:"
find . -name "*.routes.js" -o -name "*leinn*" -o -name "*activity*" | grep -E "(routes|leinn)" | head -10

echo ""
echo "🔍 Frontend components avec 'leinn' ou 'projet':"
find . -path "./node_modules" -prune -o -name "*.jsx" -type f -exec grep -l "leinn\|Leinn\|projet.*display" {} \; 2>/dev/null | head -8

echo ""
echo "📡 Endpoints POST/PUT (backend):"
grep -r "router\.\(post\|put\)" --include="*.routes.js" | grep -i "leinn\|project\|activity" | head -10

echo ""
echo "💾 Appels fetch/axios (frontend):"
grep -r "fetch\|axios\|\/api\/" --include="*.jsx" --include="*.js" | grep -E "(leinn|project|POST|PUT)" | head -10