import { Injectable } from 'angular2/core';
import {Http }       from  'angular2/http';
import 'rxjs/add/operator/map';

@Injectable()
export class PostService {
    url="https://jsonplaceholder.typicode.com/posts";
    
    constructor(private http:Http) { }

     getPosts(){
         return this.http
            .get(this.url)
            .map(resp => resp.json());
     }
     getComments(postId){
        return this.http
            .get(this.url + '/'+ postId + '/comments')
            .map(resp => resp.json());
     }

}