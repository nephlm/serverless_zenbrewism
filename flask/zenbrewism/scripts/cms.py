#!/usr/bin/env python

import click

import zenbrewism.models as models

@click.group()
def cli(): 
    pass

@cli.command()
@click.argument('path')
def publish(path):
    click.echo('publish')
    click.echo(path)
    pages = models.PageCollection(stage='dev')
    print(pages.prefix)
    print(pages.bucket)
    print(pages.index)
    if pages.save(models.get_from_file(path)):
        click.echo('written')   
    else:
        click.echo('write failure')   


if __name__ == '__main__':
    cli()