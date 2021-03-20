import * as path from 'path';

import Clubhouse, { Epic, Project, Story, ID } from 'clubhouse-lib';
import * as moment from 'moment';
import * as vscode from 'vscode';
import { Event, EventEmitter, ExtensionContext, ProviderResult, TreeDataProvider, TreeItem } from 'vscode';

import { exec, allMatches, fetchAll } from './utils';
import { worker } from 'node:cluster';

class EpicItem extends TreeItem {
    public stories: StoryItem[] = [];

    constructor(label: string, public item: any | undefined) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.contextValue = 'epic';
    }
}

class StoryItem extends TreeItem {
    constructor(label: string, public item: any) {
        super(label);
    }
}


export class ClubhouseIssuesProvider implements TreeDataProvider<TreeItem> {
    
    private _onDidChangeTreeData = new EventEmitter<TreeItem | undefined>();
    onDidChangeTreeData?: Event<void | TreeItem | null | undefined> | undefined;

    private fetching = false;
	private lastFetch: number | undefined;
	private children: Promise<TreeItem[]> | undefined;

    private selectedProject: Project | undefined;

    private apitoken: string | undefined;

    constructor(private context: ExtensionContext) {

        const config = vscode.workspace.getConfiguration('clubhouse');
        this.apitoken = config.get<string>('apitoken')
        // Use the console to output diagnostic information (console.log) and errors (console.error)
        // This line of code will only be executed once when your extension is activated
        console.log('Congratulations, your extension "helloworld" is now active!');

        // The command has been defined in the package.json file
        // Now provide the implementation of the command with registerCommand
        // The commandId parameter must match the command field in package.json
        let disposable = vscode.commands.registerCommand('helloworld.helloWorld', () => {
            // The code you place here will be executed every time your command is executed

            // Display a message box to the user
            vscode.window.showInformationMessage('Hello VS Code!');
        });

        context.subscriptions.push(disposable);

        let disposable2 = vscode.commands.registerCommand('helloworld.refresh', () => {
            // The code you place here will be executed every time your command is executed

            // Display a message box to the user
            vscode.window.showInformationMessage('Refreshing Clubhouse Issues!');
        });

        context.subscriptions.push(disposable2);
    }

    getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
        return element;
    }

    async getChildren(element?: TreeItem): Promise<TreeItem[]> {
        if (element instanceof EpicItem) {
            return element.stories;
        }

        if (!this.children) {
            try {
                this.fetching = true;
                this.lastFetch = Date.now();
                await (this.children = this.fetchChildren());
            } finally {
                this.fetching = false;
            }
        }

        return this.children;
    }

    private async refresh() {
        if (!this.fetching) {
            this.children = undefined;
            await this.getChildren();
            this._onDidChangeTreeData.fire(this.children);
        }
    }

    private async poll() {
        if (!this.lastFetch || this.lastFetch + 30 * 60 * 1000 < Date.now()) {
            return this.refresh();
        }
    }

    private async fetchChildren(element?: TreeItem): Promise<TreeItem[]> {
        let epics: EpicItem[];
        try {
            
            epics = await this.fetchAllEpics(this.apitoken || '');
        } catch (err) {
            throw err;
        }

        let stories: StoryItem[];
        try {
            stories = await this.fetchAllStories(this.apitoken || '');
        } catch (err) {
            throw err;
        }

        return stories;
    }

    private async fetchAllProjects(apiToken: string) {
        const client = Clubhouse.create(apiToken);

        return await client.listProjects();
    }

    private async fetchAllEpics(apiToken: string) {
        const client = Clubhouse.create(apiToken);

        const epics = await client.listEpics();

        return epics.map((epic: Epic) => {
            const epicItem = new EpicItem(`${epic.name} (#${epic.id})`, epic);

            return epicItem;
        });
        
        
    }

    private async fetchAllStories(apiToken: string) {
        if (!this.selectedProject) {
            vscode.window.showWarningMessage('Select a Clubhouse Project before getting stories!');
        }
        const client = Clubhouse.create(apiToken);

        const stories = await client.listStories(this.selectedProject?.id as ID, false);
        
        return stories.map((story: Story) => {
            const storyItem = new StoryItem(`${story.name} (#${story.id})`, story);
            return storyItem;
        });
    }
    
    

}