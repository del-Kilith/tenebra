import base64
import io
from os import listdir
from os.path import isfile, join
from PIL import Image


def pillow_image_to_base64_string(img):
    buffered = io.BytesIO()
    img.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")


def base64_string_to_pillow_image(base64_str):
    return Image.open(io.BytesIO(base64.decodebytes(bytes(base64_str, "utf-8"))))


if __name__ == '__main__':
    path = './images'
    images = [Image.open(join(path, f)) for f in listdir(path) if isfile(join(path, f))]
    data = [
        "'data:image/jpeg;base64," + pillow_image_to_base64_string(image) + "'"
        for image in images
    ]

    template = 'const Images = [*]'
    template = template.replace('*', ','.join(data))
    with open('./gen-images.js', 'w+') as f:
        f.write(template)
    print(f'Loaded {len(data)} images')