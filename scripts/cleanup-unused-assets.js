#!/usr/bin/env node
import { readFileSync, readdirSync, statSync, unlinkSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const publicAssetsDir = join(projectRoot, 'public/assets/images');

// Extract all image references from the codebase
function extractImageReferences() {
    const usedImages = new Set();
    
    // Images referenced in Astro files
    const astroRefs = [
        'renders/hero-iez.png',
        'renders/TG_PERFECT_Metro_Maintenance_Corridor_Clean_SciFi_Wide_Ambient_00003_.png',
        'renders/hero-main.png',
        'factions/TG_Enhanced_Emblem_IronScavengers_00002_.png',
        'factions/TG_Enhanced_Emblem_Directorate_00002_.png',
        'factions/TG_FIXED_Emblem_IronScavengers_00001_.png',
        'factions/TG_Enhanced_Emblem_Free77_00002_.png',
        'factions/TG_Emblem_Var_CorporateHegemony_00001_.png',
        'factions/TG_Enhanced_Emblem_NomadClans_00002_.png',
        'factions/TG_Emblem_Var_ArchiveKeepers_00001_.png',
        'factions/TG_Emblem_Var_CivicWardens_00001_.png',
        'renders/hero-wastes.png',
        'environments/iez-facility-clean.png',
        'environments/metro-corridor-premium.png',
        'environments/research-lab-clean.png',
        'environments/tech-wastes-gritty.png',
        'environments/underground-bunker-gritty.png',
        'environments/security-checkpoint-clean.png',
        'renders/TG_PERFECT_Tech_Wastes_Exterior_Clean_SciFi_Perspective_Atmospheric_00001_.png',
        'environments/TG_PERFECT_Corporate_Lobby_Interior_Clean_SciFi_Wide_Ambient_00001_.png',
        'factions/directorate-emblem-enhanced.png',
        'factions/directorate-emblem-ultimate.png',
        'factions/iron-scavengers-emblem.png',
        'factions/free77-emblem.png',
        'factions/nomad-clans-emblem.png',
        'renders/TG_PERFECT_IEZ_Facility_Interior_Clean_SciFi_Detail_Dramatic_00002_.png',
        'environments/HQ_IEZ_Facility_Interior_Clean_SciFi_2560x1440_s30_cfg4.0_00001_.png',
        'environments/HQ_Metro_Maintenance_Corridor_Clean_SciFi_1920x1080_s30_cfg4.0_00001_Toned.png',
        'environments/HQ_Metro_Maintenance_Corridor_Clean_SciFi_2560x1440_s30_cfg4.0_00001_.png',
        'environments/HQ_Metro_Maintenance_Corridor_Clean_SciFi_2048x1152_s22_cfg4.2_00001_Toned.png',
        'environments/LORE_CleanSciFi_1080p_00001_.png',
        'environments/LORE_Metro_CleanSciFi_1080p_00001_.png',
        'environments/PROD_CONCEPT_ART_235432_.png',
        'environments/REFINE_SHARP_00003_1920w.png',
        'factions/TG_ULTIMATE_DIR_Emblem_20250812_232028_00001_.png',
        'factions/TG_Enhanced_DIR_Emblem_20250812_231441_00001_.png',
        'factions/Free77_palette.png',
        'factions/NomadClans_palette.png',
        'factions/CivicWardens_palette.png',
        'ui/damage_ballistic_128.png',
        'ui/damage_ion_128.png',
        'ui/extract_128.png',
        'ui/PROD_UI_ELEMENTS_235429_00001_.png',
        'logo.png'
    ];

    // Add essential files that are always needed
    const essentialFiles = [
        'manifest.json'
    ];

    // Add all references to the set
    astroRefs.forEach(ref => usedImages.add(ref));
    essentialFiles.forEach(file => usedImages.add(file));

    return usedImages;
}

// Get all image files recursively
function getAllImageFiles(dir, baseDir = dir) {
    const files = [];
    const items = readdirSync(dir);
    
    for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
            files.push(...getAllImageFiles(fullPath, baseDir));
        } else if (item.match(/\.(png|jpg|jpeg|json)$/i)) {
            const relativePath = fullPath.replace(baseDir + '/', '');
            files.push(relativePath);
        }
    }
    
    return files;
}

// Main cleanup function
function cleanupUnusedAssets() {
    console.log('🔍 Analyzing asset usage...');
    
    const usedImages = extractImageReferences();
    const allImages = getAllImageFiles(publicAssetsDir);
    
    console.log(`📊 Found ${allImages.length} total asset files`);
    console.log(`✅ Found ${usedImages.size} used asset references`);
    
    const unusedImages = allImages.filter(img => !usedImages.has(img));
    
    console.log(`🗑️  Found ${unusedImages.length} unused assets:`);
    
    let totalSizeSaved = 0;
    let filesDeleted = 0;
    
    // Show what we're about to delete (dry run first)
    console.log('\nUnused assets to be removed:');
    unusedImages.forEach(img => {
        const fullPath = join(publicAssetsDir, img);
        if (existsSync(fullPath)) {
            const stat = statSync(fullPath);
            totalSizeSaved += stat.size;
            console.log(`  - ${img} (${(stat.size / 1024 / 1024).toFixed(2)}MB)`);
        }
    });
    
    console.log(`\n📈 Total space to be saved: ${(totalSizeSaved / 1024 / 1024).toFixed(2)}MB`);
    
    // Ask for confirmation (in actual usage, you'd want user input here)
    const shouldDelete = process.argv.includes('--execute');
    
    if (shouldDelete) {
        console.log('\n🗑️  Deleting unused assets...');
        
        unusedImages.forEach(img => {
            const fullPath = join(publicAssetsDir, img);
            if (existsSync(fullPath)) {
                try {
                    unlinkSync(fullPath);
                    filesDeleted++;
                    console.log(`  ✅ Deleted: ${img}`);
                } catch (error) {
                    console.error(`  ❌ Failed to delete ${img}: ${error.message}`);
                }
            }
        });
        
        console.log(`\n🎉 Cleanup complete!`);
        console.log(`   Files deleted: ${filesDeleted}`);
        console.log(`   Space saved: ${(totalSizeSaved / 1024 / 1024).toFixed(2)}MB`);
        
        // Update manifest.json to only include remaining assets
        updateManifest(usedImages);
        
    } else {
        console.log('\n⚠️  This was a dry run. To actually delete files, run:');
        console.log('   node scripts/cleanup-unused-assets.js --execute');
    }
}

function updateManifest(usedImages) {
    console.log('📝 Updating manifest.json...');
    
    const manifestPath = join(publicAssetsDir, 'manifest.json');
    if (existsSync(manifestPath)) {
        try {
            const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
            const newManifest = {};
            
            // Filter manifest to only include used images
            Object.keys(manifest).forEach(category => {
                newManifest[category] = {};
                Object.keys(manifest[category]).forEach(filename => {
                    const relativePath = `${category}/${filename}`;
                    if (usedImages.has(relativePath) || usedImages.has(filename)) {
                        newManifest[category][filename] = manifest[category][filename];
                    }
                });
            });
            
            writeFileSync(manifestPath, JSON.stringify(newManifest, null, 2));
            console.log('✅ Updated manifest.json');
            
        } catch (error) {
            console.error(`❌ Failed to update manifest: ${error.message}`);
        }
    }
}

// Run the cleanup
cleanupUnusedAssets();