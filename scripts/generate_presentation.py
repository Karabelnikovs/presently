import json
import sys
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pptx.util import Pt
import pptx.api
import zipfile
import xml.etree.ElementTree as ET
import os

# Monkey patch to allow loading .potx files
def new_is_pptx_package(presentation_part):
    return presentation_part.content_type in (
        "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml",
        "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml",
    )
pptx.api._is_pptx_package = new_is_pptx_package

# Command-line args: template_path output_path data_path
if len(sys.argv) != 4:
    print("Usage: python generate_presentation.py <template_path> <output_path> <data_path>")
    sys.exit(1)

template_path = sys.argv[1]
output_path = sys.argv[2]
data_path = sys.argv[3]

# Load data
with open(data_path, 'r') as f:
    data = json.load(f)

slides_data = data['slides']

# Load presentation template
prs = Presentation(template_path)

# Remove all existing slides
slide_ids = [sld.rId for sld in prs.slides._sldIdLst]
for rId in slide_ids:
    prs.part.drop_rel(rId)
prs.slides._sldIdLst.clear()

# Get layouts (assume 0: title, 1: content; adjust if your templates differ)
slide_layouts = prs.slide_layouts
title_layout = slide_layouts[0]
content_layout = slide_layouts[1]  # Or dynamically find by name if needed

for i, slide_data in enumerate(slides_data):
    # Choose layout
    layout = title_layout if i == 0 else content_layout

    # Add slide
    slide = prs.slides.add_slide(layout)

    # Populate title (preserves font/style from placeholder)
    title_shape = slide.shapes.title
    if title_shape:
        title_shape.text = slide_data['title']

    # Find body placeholder (type 7=body, 17=subtitle for title slides)
    body_shape = None
    for shape in slide.placeholders:
        ph_type = shape.placeholder_format.type
        if ph_type == 7:  # BODY
            body_shape = shape
            break
        elif i == 0 and ph_type == 17:  # SUBTITLE for title slide
            body_shape = shape
            break

    # Fallback: Find largest non-title text shape
    if body_shape is None:
        candidates = [sh for sh in slide.shapes if sh.has_text_frame and sh != title_shape]
        if candidates:
            body_shape = max(candidates, key=lambda sh: sh.height)  # Largest likely body

    # Populate body bullets (adds paragraphs, inherits bullet style/font from layout)
    if body_shape and 'bullets' in slide_data:
        tf = body_shape.text_frame
        tf.clear()  # Clear placeholder text, but keep formatting
        for bullet in slide_data['bullets']:
            p = tf.add_paragraph()
            p.text = bullet
            # If needed, explicitly set level for bullets (0 = top level)
            p.level = 0

# Save the presentation
prs.save(output_path)

# Fix content type in [Content_Types].xml
temp_path = output_path + '.temp'
with zipfile.ZipFile(output_path, 'r') as zin:
    with zipfile.ZipFile(temp_path, 'w') as zout:
        for item in zin.infolist():
            if item.filename == '[Content_Types].xml':
                xml = zin.read(item.filename)
                tree = ET.fromstring(xml)
                for elem in tree.iter():
                    if 'PartName' in elem.attrib and elem.attrib['PartName'] == '/ppt/presentation.xml':
                        elem.attrib['ContentType'] = 'application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml'
                new_xml = ET.tostring(tree, encoding='utf-8', method='xml')
                zout.writestr(item, new_xml)
            else:
                zout.writestr(item, zin.read(item.filename))
os.remove(output_path)
os.rename(temp_path, output_path)

print(f"Presentation saved to {output_path}")