# Reference to Semantic Turkey Change Log
This changelog is limited to changes brought exclusively to the Vocbench 3 client application.
The full changelog of the platform includes also changes brought to the Semantic Turkey backend:

https://bitbucket.org/art-uniroma2/semantic-turkey/src/master/ChangeLog.txt

# 5.0.1-beta.1 (dd-MM-yyyy)
  * Enabled multivalue creation when enriching a property with a typed literal value.
  * Added the "Copy value to other locales" action to the language-tagged values in the "Lexicalizations", "Notes" and "Other properties" ResourceView partitions.
    This action is available only if exist locales for the language of the value.
  * Fixed a bug that prevented to change the mapping property in the alignment validation.

# 5.0.0 (30-01-2019)
  * Enabled multiselection in trees and lists when adding a value to a property.
  * Enabled multivalue creation when enriching a property with a plain literal value.
  * Implemented the mass assignment of concepts to a scheme.
  * Implemented a first experimental Graph visualization of data, ontology model and SPARQL graph-query results (available only if Experimental Features are enabled).
  * Implemented DatasetCatalog management and its use in project creation (for preloading data) and data import.
  * Enabled both "Edit" and "Edit literal content" actions for literal values in ResourceView.
  * Fixed bug in the Validation tab, where the optional time lower bound was always ignored.
  * Improved the messages in the error dialogs.
  * Updated e-mail configuration, now it is possible to use, beside SSL, TLS or no cryptographic protocol at all;
    Added possibility to test the e-mail configuration.
  * Changed dynamic settings on vbconfig.js.
  * Minor improvements/changes to UI.
  * Bugfixes.

# 4.0.2 (27-07-2018)
  * no changes to the client, consult ST ChangeLog for details on the server
  
# 4.0.1 (26-07-2018)
  * Fixed bug that ignored the language during the creation of plain literal;
  * Minor bugfixes.

# 4.0.0 (23-07-2018)
  * Improved ResourceView
    * Enabled "Add manually" option for "notes" partition;
    * Added "Add value from another project" action in some partitions;
    * Changed the "show more" function in "show all";
    * Added a status bar (footer) that show details about the resource position.
  * Enabled the possibility to create resources when enriching a property.
  * Improved the Collaboration System:
    * Improved the setup;
    * Enabled possibility to add a resource to an existing issue (Collaboration System tool);
    * Removed from the "experimental features".
  * Improved Sheet2RDF (no more an "experimental features").
  * Enabled management of OntoLex projects
    * Allowed creation of OntoLex projects (both onto-model and lexical model);
    * Added Lexicon and Lex.Entry panels in Data page;
    * Added new dedicated ResourceView partitions.
  * Added Datatype panel in Data page.
  * Introduced the new search-mode for exploring Concepts and LexicalEntries.
  * Enabled customization of the concept tree hierarchy:
    * Enabled possibility to customize the property during the creation of a sub concept;
    * Enabled the customization of the properties on which base the tree hierarchy.
  * Added a button for deprecating a resource in tree/list panel toolbar.
  * Implemented the management of UsersGroup and their constraints on ConceptSchemes.
  * Implemented the search-assisted alignment.
  * Implemented "advanced search".
  * Implemented "custom search" based on parameterized queries.
  * Improved search by adding two new search modes ("exact" and "fuzzy") and a "use notes" parameter.
  * Improved SPARQL:
    * Implemented parameterized queries;
    * Implemented the storage management of "standard" and parameterized queries.
  * Implemented UI for the management of MetadataRegistry.
  * Rearranged "Metadata Management" and "Namespaces and Imports" sections.
  * Adopted new Extensions in place of old Plugins.
  * Improved Settings and Configurations:
    * Implemented storage.
    * Adopted dedicated input fields in forms in order to help the user to enter suitable values.
  * Enabled possibility to store and load an exporter chain.
  * Implemented UI for RdfFormatter and Deployer in the data exporter.
  * Added importer and lifter for zThes format.
  * Improved UI for changing the system administrator and email configuration.
  * Enabled the change password feature.
  * Enabled the possibility to change the credentials of remote repositories.
  * minor bug-fixes.

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