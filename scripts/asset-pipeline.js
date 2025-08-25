#!/usr/bin/env node

/**
 * Terminal Grounds Asset Pipeline
 * Automatically syncs assets from the main Terminal-Grounds repository
 * to the website's image directory for deployment
 */

const fs = require('fs').promises;
const path = require('path');

class AssetPipeline {
    constructor() {
        this.sourceRepo = path.resolve('../Terminal-Grounds');
        this.targetDir = path.resolve('./site/assets/images');
        this.styleStaging = path.join(this.sourceRepo, 'Style_Staging');
        
        this.assetManifest = {
            environments: {},
            weapons: {},
            vehicles: {},
            factions: {},
            renders: {},
            ui: {},
            total: 0,
            lastUpdated: new Date().toISOString()
        };
    }

    async init() {
        console.log('🚀 Terminal Grounds Asset Pipeline Starting...');
        console.log(`Source: ${this.sourceRepo}`);
        console.log(`Target: ${this.targetDir}`);
        
        try {
            await this.verifyDirectories();
            await this.syncAssets();
            await this.generateManifest();
            console.log('✅ Asset pipeline completed successfully!');
            console.log(`📊 Total assets processed: ${this.assetManifest.total}`);
        } catch (error) {
            console.error('❌ Pipeline failed:', error.message);
            process.exit(1);
        }
    }

    async verifyDirectories() {
        const dirs = [this.sourceRepo, this.targetDir, this.styleStaging];
        
        for (const dir of dirs) {
            try {
                await fs.access(dir);
                console.log(`✓ Directory exists: ${dir}`);
            } catch (error) {
                throw new Error(`Required directory not found: ${dir}`);
            }
        }

        // Ensure target subdirectories exist
        const subdirs = ['environments', 'weapons', 'vehicles', 'factions', 'renders', 'ui'];
        for (const subdir of subdirs) {
            const fullPath = path.join(this.targetDir, subdir);
            await fs.mkdir(fullPath, { recursive: true });
        }
    }

    async syncAssets() {
        console.log('🔄 Syncing assets...');

        // Sync from Style_Staging directory (recent generations)
        await this.syncStyleStaging();

        // Sync from main repository Content directories
        await this.syncContentAssets();

        // Sync emblems and faction assets
        await this.syncFactionAssets();
    }

    async syncStyleStaging() {
        console.log('📁 Processing Style_Staging directory...');
        
        const recentDir = path.join(this.styleStaging, '_Recent_Generations');
        
        try {
            const files = await fs.readdir(recentDir);
            const imageFiles = files.filter(f => /\.(png|jpg|jpeg)$/i.test(f));
            
            for (const file of imageFiles) {
                const sourcePath = path.join(recentDir, file);
                const category = this.categorizeAsset(file);
                const targetPath = path.join(this.targetDir, category, this.cleanFilename(file));
                
                await this.copyAsset(sourcePath, targetPath, category, file);
            }
            
            console.log(`✓ Processed ${imageFiles.length} files from Style_Staging`);
        } catch (error) {
            console.warn(`⚠ Could not process Style_Staging: ${error.message}`);
        }
    }

    async syncContentAssets() {
        console.log('📁 Processing Content directory...');
        
        const contentDir = path.join(this.sourceRepo, 'Content');
        const assetMappings = {
            'TG/Icons': 'ui',
            'TG/ConceptArt': 'environments', 
            'TG/Vehicles': 'vehicles'
        };

        for (const [sourceSubdir, targetCategory] of Object.entries(assetMappings)) {
            const sourcePath = path.join(contentDir, sourceSubdir);
            
            try {
                await this.processDirectory(sourcePath, targetCategory);
            } catch (error) {
                console.warn(`⚠ Could not process ${sourceSubdir}: ${error.message}`);
            }
        }
    }

    async syncFactionAssets() {
        console.log('📁 Processing faction emblems...');
        
        // Check various possible locations for faction assets
        const possiblePaths = [
            path.join(this.sourceRepo, 'docs/Concepts/Palettes'),
            path.join(this.sourceRepo, 'Content/TG/Icons'),
            path.join(this.styleStaging, 'Clean_SciFi'),
            path.join(this.styleStaging, 'Gritty_Realism')
        ];

        for (const sourcePath of possiblePaths) {
            try {
                await fs.access(sourcePath);
                await this.processDirectory(sourcePath, 'factions', true);
            } catch (error) {
                // Continue if directory doesn't exist
            }
        }
    }

    async processDirectory(sourcePath, targetCategory, isFaction = false) {
        try {
            const files = await fs.readdir(sourcePath, { withFileTypes: true });
            
            for (const file of files) {
                if (file.isDirectory()) {
                    await this.processDirectory(
                        path.join(sourcePath, file.name), 
                        targetCategory, 
                        isFaction
                    );
                } else if (this.isImageFile(file.name)) {
                    const isRelevant = isFaction ? 
                        this.isFactionAsset(file.name) : 
                        this.isRelevantAsset(file.name, targetCategory);
                    
                    if (isRelevant) {
                        const sourceFile = path.join(sourcePath, file.name);
                        const targetFile = path.join(
                            this.targetDir, 
                            targetCategory, 
                            this.cleanFilename(file.name)
                        );
                        
                        await this.copyAsset(sourceFile, targetFile, targetCategory, file.name);
                    }
                }
            }
        } catch (error) {
            console.warn(`⚠ Error processing directory ${sourcePath}: ${error.message}`);
        }
    }

    async copyAsset(sourcePath, targetPath, category, originalName) {
        try {
            const stats = await fs.stat(sourcePath);
            
            // Check if target file exists and is newer
            try {
                const targetStats = await fs.stat(targetPath);
                if (targetStats.mtime >= stats.mtime) {
                    return; // Skip if target is newer
                }
            } catch (error) {
                // Target doesn't exist, proceed with copy
            }

            await fs.copyFile(sourcePath, targetPath);
            
            this.assetManifest[category][originalName] = {
                filename: path.basename(targetPath),
                size: stats.size,
                modified: stats.mtime.toISOString(),
                source: sourcePath
            };
            
            this.assetManifest.total++;
            console.log(`✓ Copied: ${originalName} -> ${category}/${path.basename(targetPath)}`);
        } catch (error) {
            console.warn(`⚠ Failed to copy ${originalName}: ${error.message}`);
        }
    }

    categorizeAsset(filename) {
        const lower = filename.toLowerCase();
        
        if (lower.includes('weapon') || lower.includes('rifle') || lower.includes('plasma') || lower.includes('ion')) {
            return 'weapons';
        }
        if (lower.includes('vehicle') || lower.includes('walker') || lower.includes('helo') || lower.includes('apc')) {
            return 'vehicles';
        }
        if (lower.includes('emblem') || lower.includes('faction') || lower.includes('directorate') || lower.includes('scavenger')) {
            return 'factions';
        }
        if (lower.includes('hero') || lower.includes('render')) {
            return 'renders';
        }
        if (lower.includes('ui') || lower.includes('icon')) {
            return 'ui';
        }
        
        // Default to environments for concept art and environmental assets
        return 'environments';
    }

    isImageFile(filename) {
        return /\.(png|jpg|jpeg|webp)$/i.test(filename);
    }

    isRelevantAsset(filename, category) {
        const lower = filename.toLowerCase();
        
        // Skip temporary, meta, and backup files
        if (lower.includes('temp') || lower.includes('meta') || lower.includes('backup')) {
            return false;
        }
        
        // Skip very small thumbnails
        if (lower.includes('_64') && !lower.includes('_64x64')) {
            return false;
        }
        
        return true;
    }

    isFactionAsset(filename) {
        const lower = filename.toLowerCase();
        const factionKeywords = [
            'directorate', 'iron', 'scavenger', 'free77', 'nomad', 'clan',
            'corporate', 'hegemony', 'archive', 'keeper', 'civic', 'warden',
            'emblem', 'insignia', 'badge', 'faction'
        ];
        
        return factionKeywords.some(keyword => lower.includes(keyword));
    }

    cleanFilename(filename) {
        // Clean up complex generated filenames while preserving meaning
        let cleaned = filename
            .replace(/^\\d{8}_\\d{6}_/, '') // Remove timestamp prefix
            .replace(/_\\d{5}_?$/, '')       // Remove suffix numbers
            .replace(/_{2,}/g, '_')         // Replace multiple underscores
            .replace(/^_|_$/g, '');         // Remove leading/trailing underscores
        
        // Keep original if cleaning made it too short or unclear
        if (cleaned.length < 5 || !cleaned.includes('.')) {
            return filename;
        }
        
        return cleaned;
    }

    async generateManifest() {
        console.log('📋 Generating asset manifest...');
        
        const manifestPath = path.join(this.targetDir, 'manifest.json');
        await fs.writeFile(
            manifestPath, 
            JSON.stringify(this.assetManifest, null, 2), 
            'utf8'
        );
        
        console.log(`✓ Manifest generated: ${manifestPath}`);
        
        // Generate HTML snippet for easy integration
        await this.generateHTMLSnippets();
    }

    async generateHTMLSnippets() {
        console.log('🔧 Generating HTML integration snippets...');
        
        const snippetsDir = path.join(path.dirname(this.targetDir), 'snippets');
        await fs.mkdir(snippetsDir, { recursive: true });
        
        // Generate gallery items HTML
        let galleryHTML = '';
        
        for (const [category, assets] of Object.entries(this.assetManifest)) {
            if (category === 'total' || category === 'lastUpdated') continue;
            
            for (const [originalName, assetInfo] of Object.entries(assets)) {
                const displayName = this.generateDisplayName(originalName);
                const description = this.generateDescription(originalName, category);
                const style = this.detectStyle(originalName);
                const rarity = this.detectRarity(originalName);
                
                galleryHTML += `
                    <div class="asset-item" data-category="${category}" data-style="${style}">
                        <img src="/assets/images/${category}/${assetInfo.filename}" alt="${displayName}" class="asset-image" loading="lazy">
                        <div class="asset-overlay">
                            <h4>${displayName}</h4>
                            <p>${description}</p>
                            <span class="rarity-tag ${rarity}">${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>
                        </div>
                    </div>`;
            }
        }
        
        await fs.writeFile(
            path.join(snippetsDir, 'gallery-items.html'),
            galleryHTML.trim(),
            'utf8'
        );
        
        console.log('✓ HTML snippets generated');
    }

    generateDisplayName(filename) {
        return filename
            .replace(/\\.[^.]+$/, '')           // Remove extension
            .replace(/[-_]/g, ' ')             // Replace separators with spaces
            .replace(/\\b\\w/g, l => l.toUpperCase()); // Capitalize words
    }

    generateDescription(filename, category) {
        const lower = filename.toLowerCase();
        
        const descriptions = {
            environments: {
                'iez': 'Industrial Exclusion Zone facility',
                'tech': 'Technology sector ruins',
                'metro': 'Underground transit system',
                'research': 'Pre-cascade laboratory complex',
                'security': 'Military checkpoint installation',
                'bunker': 'Fortified underground shelter'
            },
            weapons: {
                'plasma': 'High-energy particle weapon',
                'rifle': 'Standard infantry firearm', 
                'ion': 'Directed energy system',
                'mk2': 'Second generation equipment'
            },
            vehicles: {
                'walker': 'Bipedal assault platform',
                'helo': 'Rotorcraft reconnaissance unit',
                'apc': 'Armored troop transport'
            },
            factions: {
                'directorate': 'Sky Bastion military order',
                'scavenger': 'Salvage specialist organization',
                'free77': 'Professional mercenary company',
                'nomad': 'Mobile clan federation'
            }
        };

        const categoryDescs = descriptions[category] || {};
        
        for (const [keyword, desc] of Object.entries(categoryDescs)) {
            if (lower.includes(keyword)) {
                return desc;
            }
        }
        
        return `${category.charAt(0).toUpperCase() + category.slice(1)} asset`;
    }

    detectStyle(filename) {
        const lower = filename.toLowerCase();
        
        if (lower.includes('gritty') || lower.includes('worn') || lower.includes('damaged')) {
            return 'gritty';
        }
        if (lower.includes('clean') || lower.includes('pristine') || lower.includes('new')) {
            return 'clean';
        }
        if (lower.includes('hero') || lower.includes('render')) {
            return 'hero';
        }
        if (lower.includes('tactical') || lower.includes('military')) {
            return 'tactical';
        }
        if (lower.includes('emblem') || lower.includes('insignia')) {
            return 'emblem';
        }
        
        return 'standard';
    }

    detectRarity(filename) {
        const lower = filename.toLowerCase();
        
        if (lower.includes('legendary') || lower.includes('hero') || lower.includes('unique')) {
            return 'legendary';
        }
        if (lower.includes('rare') || lower.includes('enhanced') || lower.includes('elite')) {
            return 'rare';
        }
        if (lower.includes('uncommon') || lower.includes('improved') || lower.includes('advanced')) {
            return 'uncommon';
        }
        
        return 'common';
    }
}

// Run the pipeline if called directly
if (require.main === module) {
    const pipeline = new AssetPipeline();
    pipeline.init().catch(console.error);
}

module.exports = AssetPipeline;