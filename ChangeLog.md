# 4.0.0-beta.1 (dd-mm-yyyy)
  * Enabled "Add manually" option for notes ResourceView partition.
  * Enabled possibility to add a resource to an existing issue (Collaboration System tool).
  * Enabled creation of skosxl labels that are instances of a subClass of skosxl:Label.
  * Allowed creation of OntoLex projects (both onto-model and lexical model).
  * Implemented the storage management of SPARQL queries.
  * Enabled customization of the base broader property in the creation of a concepts hierarcy.
  * Enabled the possibility to change the credentials of remote repositories.

# 3.0.0 (08-02-2018)
  * Changed license to BSD-3-Clause.
  * toggler for hiding the class instance count
  * Improved search enabling language restriction and including locales.  
  * Implemented autocompletion support in search bar.
  * Implemented new ICVs.
  * added the possibility to change the type of a class when creating it
  * Enabled creation of RDFS projects (default type for classes is rdfs:Class)
  * Improved export of SPARQL query results
    * added the export to spreadsheet (for tuple and graph query) an rdf (only for graph query)
    * introduced the export filters  
  *	Implemented alpha-test versions of Collaboration System and Sheet2RDF (marked as experimental)
  * Enabled customization of class-tree viewing preference (e.g. default root class and filter on class' children).
  * Added support for the definition of mandatory languages for projects.
  * Fixed Exceptions when creating a version dump.
  * Added the possibility to configure GraphDB SE (Standard Edition, paid version) repositories.
  * Changed capabilities of some default roles.  
  * Added new actions to ResourceView partitions (in particular, the possibility to add manually a value)
  * Added a filter-out option for deprecated concepts
  * Automatically update the ACL for a project after this has been modified
  * provide a user-friendly message for reporting the change-tracking sail missing from the triplestore
  * Added a property in vbconfig.js to specify a path of the SemanticTurkey URL
  * allow for resizeable configuration fields
  * introduced avatar URL property for users, to show images from the web as avatars
  * minor bug-fixes

# 2.0.0 (30-10-2017)
  * Added option to keep in sync the selected ResourceView Tab resource and the resource in the trees/lists.
  * Implemented UI for changing ordered languages in the render.
  * Added a quick selector for search mode in the search bar.
  * Added the clone user role functionality.
  * Updated ST services invocation for adding property value (also using CustomForm).
  * Minor UI improvements and bug fixed.