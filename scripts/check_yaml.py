#!/usr/bin/env python

"""
Edited from ccf-deadlines repository.

To use it normally as git pre-commit hook,
make a symlink and install dependencies:
$ ln -s ../../scripts/validate .git/hooks/pre-commit
$ pip install PyYAML jsonschema
"""

import os
import sys

from io import StringIO
from pprint import pprint
from unittest import TestCase, TestLoader, TextTestRunner

import jsonschema
import jsonschema.exceptions

import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
MF_SCHEMA = None
MW_SCHEMA = None

class NoDatesSafeLoader(yaml.SafeLoader):
    @classmethod
    def remove_implicit_resolver(cls, tag_to_remove):
        """
        Remove implicit resolvers for a particular tag

        Takes care not to modify resolvers in super classes.

        We want to load datetimes as strings, not dates, because we
        go on to serialise as json which doesn't have the advanced types
        of yaml, and leads to incompatibilities down the track.
        """
        if not 'yaml_implicit_resolvers' in cls.__dict__:
            cls.yaml_implicit_resolvers = cls.yaml_implicit_resolvers.copy()

        for first_letter, mappings in cls.yaml_implicit_resolvers.items():
            cls.yaml_implicit_resolvers[first_letter] = [(tag, regexp) 
                                                         for tag, regexp in mappings
                                                         if tag != tag_to_remove]

NoDatesSafeLoader.remove_implicit_resolver('tag:yaml.org,2002:timestamp')

def load_mf_schema():
    global MF_SCHEMA
    with open(os.path.join(ROOT, 'scripts', 'mf-list-schema.yaml'), 'r', encoding="utf-8") as schema:
        MF_SCHEMA = yaml.load(schema, Loader=yaml.SafeLoader)

def load_mw_schema():
    global MW_SCHEMA
    with open(os.path.join(ROOT, 'scripts', 'mw-list-schema.yaml'), 'r', encoding="utf-8") as schema:
        MW_SCHEMA = yaml.load(schema, Loader=yaml.SafeLoader)

class MFListTest(TestCase):
    def test_mf_list_yaml_schema(self):
        load_mf_schema()
        self.assertTrue(os.path.isdir(ROOT))
        try:
            mf_list_path = os.path.join(ROOT, 'public', 'lists', 'list.yaml')
            mf_list_file = open(mf_list_path, 'r', encoding="utf-8")
        except Exception:
            self.fail(msg='Cannot open the list.yaml file.')
        try:
            mf_list_yml = yaml.load(mf_list_file.read(), Loader=NoDatesSafeLoader)
        except Exception:
            self.fail(msg='list.yaml file is invalid.')
        try:
            validator = jsonschema.Draft201909Validator(MF_SCHEMA, format_checker=jsonschema.FormatChecker())
            validator.validate(mf_list_yml)
        except jsonschema.exceptions.ValidationError:
            self.fail(msg=f'list.yaml contains invalid properties')
        mf_list_file.close()

class MWListTest(TestCase):
    def test_mw_list_yaml_schema(self):
        load_mw_schema()
        self.assertTrue(os.path.isdir(ROOT))
        try:
            mw_list_path = os.path.join(ROOT, 'public', 'lists', 'list-mw.yaml')
            mw_list_file = open(mw_list_path, 'r', encoding="utf-8")
        except Exception:
            self.fail(msg='Cannot open the list.yaml file.')
        try:
            mw_list_yml = yaml.load(mw_list_file.read(), Loader=NoDatesSafeLoader)
        except Exception:
            self.fail(msg='list.yaml file is invalid.')
        try:
            validator = jsonschema.Draft201909Validator(MW_SCHEMA, format_checker=jsonschema.FormatChecker())
            validator.validate(mw_list_yml)
        except jsonschema.exceptions.ValidationError:
            self.fail(msg=f'list.yaml contains invalid properties')
        mw_list_file.close()

def run_test(testcases, msg):
    failures = 0
    for testcase in testcases:
        output = StringIO()
        suite = TestLoader().loadTestsFromTestCase(testcase)
        runner = TextTestRunner(output, verbosity=0)
        results = runner.run(suite)
        if not results.wasSuccessful():
            print(output.getvalue())
            failures += len(results.failures)
    if failures > 0:
        sys.exit(1)


def usage():
    print(__doc__)


if __name__ == '__main__':

    if '-h' in sys.argv or '--help' in sys.argv:
        usage()
        sys.exit(0)

    run_test([MFListTest, MWListTest],
             msg=('\033[1;31mThere are {0} error(s) inside repo. Please fix the errors and commit again.\033[m'))