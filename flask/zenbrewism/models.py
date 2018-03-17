import json
import os


import nodb

JSON_START = 'pre.. ### START JSON ###'
TEXTILE_START = '### START TEXTILE ###'

def get_from_file(path):
    if not os.path.isfile(path):
        print(f'not file: {path}')
        return None
    print(f'file: {path}')
    with open(path, 'r') as fp:
        file_val = fp.read()
        #print(file_val)
        if not file_val.startswith(JSON_START):
            print('WARNING: Not a valid CMS file')
            return None
        (json_val, content) = file_val.split(TEXTILE_START)
        json_val = json_val.replace(JSON_START, '')
        json_val = json_val.strip()
        content = content.strip()
        page_dict = json.loads(json_val)
        page_dict['content'] = content
        return page_dict

def get_stage_config(stage):
    if True:
        config = {'bucket': 'zappa-8bbkvux0y', 
                'root_prefix': '.nodb/dev/'}
    return config

class PageCollection(nodb.NoDB):

    def __init__(self, stage):
        self.stage_config = get_stage_config(stage)
        self.bucket = self.stage_config.get('bucket')
        self.index = 'slug'
        root_prefix = self.stage_config.get('root_prefix', '.nodb/dev/')
        self.prefix = os.path.join(root_prefix, 'pages/')


