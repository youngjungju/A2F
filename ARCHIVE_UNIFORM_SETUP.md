# Archive Uniform Feature - Setup Instructions

## Overview
The Archive Uniform feature allows users to save custom uniform designs from the Home page to the Supabase database, which will then appear in both the Archive and Explore pages.

## What's Been Implemented

### 1. Modal UI on Home Page
- Clicking "Archive Uniform" button opens a modal dialog
- Modal matches the existing design system (fonts, spacing, colors)
- Input field for uniform name with validation
- Save and Cancel buttons with loading states
- Backdrop click to close

### 2. Save Functionality
- Saves uniform data to Supabase Players table
- Stores color stops data in Teams/N/Color and Teams/N/Percentage fields
- Stores Heatmap Control parameters (Saturation, Amplitude, Lacunarity, Grain, Warp Strength)
- Sets Position as "Custom" for filtering
- Shows success/error alerts

### 3. Archive Page Updates
- Added "Custom" filter option at the bottom of the position dropdown
- Custom uniforms will appear when "Custom" is selected
- All custom uniforms appear when "All Position" is selected

### 4. Database Schema
- Added new columns to PlayerRow interface in lib/types.ts
- Created SQL migration script at scripts/add_heatmap_columns.sql

## Setup Steps

### Step 1: Add Database Columns
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `scripts/add_heatmap_columns.sql`:

```sql
ALTER TABLE "Players"
ADD COLUMN IF NOT EXISTS "Saturation" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "Amplitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "Lacunarity" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "Grain" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "Warp Strength" DOUBLE PRECISION;
```

### Step 2: Test the Feature
1. Start the development server (already running on http://localhost:3001)
2. Go to the Home page
3. Design a custom uniform using the Color Control and Heatmap Control panels
4. Click "Archive Uniform" button
5. Enter a name in the modal popup
6. Click "Save"
7. Check for success alert
8. Navigate to Archive page
9. Select "Custom" from the position dropdown
10. Verify your saved uniform appears in the grid
11. Click on your custom uniform to view it in Explore page

### Step 3: Verify Explore Page
The Explore page should automatically work with custom uniforms because:
- It uses the same `getAllPlayersFromSupabase()` function
- It reconstructs NoiseParams from the database color and parameter data
- Custom uniforms will have the saved Heatmap Control values

## Files Modified

1. **lib/types.ts**
   - Added Heatmap Control columns to PlayerRow interface

2. **app/page.tsx**
   - Added state: showNameModal, uniformName, isSaving
   - Added handleArchiveUniform() function
   - Added handleSaveUniform() function
   - Added modal UI component
   - Connected Archive Uniform button onClick

3. **app/archive/page.tsx**
   - Updated position filtering to include "Custom" at the bottom
   - Filters out "Custom" from normal position sorting

4. **scripts/add_heatmap_columns.sql**
   - New SQL migration script for database columns

## Data Flow

### Saving a Custom Uniform
1. User designs uniform on Home page
2. User clicks "Archive Uniform"
3. Modal opens, user enters name
4. handleSaveUniform() is called
5. Data is prepared:
   - Player Name: from input
   - Position: "Custom"
   - Color stops → Teams/N/Color and Teams/N/Percentage
   - Heatmap params → Saturation, Amplitude, etc.
6. Data inserted into Supabase Players table
7. Success alert shown

### Loading Custom Uniforms
1. Archive/Explore pages call getAllPlayersFromSupabase()
2. Custom uniforms included (Position = "Custom")
3. Color data reconstructed into colorStops array
4. Heatmap parameters loaded from database
5. NoiseParams object created with saved values
6. 3D uniform rendered with saved design

## Troubleshooting

### Save Not Working
- Check Supabase console for error messages
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
- Check browser console for errors
- Verify database columns were added successfully

### Custom Uniforms Not Appearing
- Check if Position field is set to "Custom" in database
- Verify getAllPlayersFromSupabase() is fetching the new records
- Check browser console for data loading errors

### Uniform Design Not Matching
- Verify all Heatmap Control parameters are saved correctly
- Check that colorStops array is reconstructed properly
- Ensure percentage calculations are correct

## Next Steps (Optional Enhancements)

1. **Add Image Generation**
   - Capture canvas screenshot when saving
   - Upload to Supabase Storage
   - Save URL in Image field

2. **Edit Custom Uniforms**
   - Add edit functionality from Archive/Explore
   - Load saved parameters back into Home controls

3. **Delete Custom Uniforms**
   - Add delete button in Archive/Explore
   - Confirmation dialog before deletion

4. **Share Uniforms**
   - Generate shareable links
   - Social media integration

## Testing Checklist

- [ ] Run SQL migration in Supabase
- [ ] Save a custom uniform from Home
- [ ] Verify success alert appears
- [ ] Check database record in Supabase
- [ ] View custom uniform in Archive (select "Custom" filter)
- [ ] Click custom uniform to view in Explore
- [ ] Verify colors match original design
- [ ] Verify Heatmap Control parameters match
- [ ] Test with multiple custom uniforms
- [ ] Test with long uniform names
- [ ] Test modal close on backdrop click
- [ ] Test modal close on Cancel button
- [ ] Test validation (empty name)
